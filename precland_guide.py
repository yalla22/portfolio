#!/usr/bin/env python3
"""
FULLY AUTONOMOUS Precision Landing:
1. Tag detected → switch to GUIDED, fly drone TOWARD tag (no descent)
2. Tag centered → switch to LAND, auto-descend onto tag
3. Tag lost mid-mission → switch to LOITER (safe hover)
Pilot only takes off; everything else automatic.
"""
import time, math, threading
import numpy as np, cv2

from picamera2 import Picamera2
from pupil_apriltags import Detector
from pymavlink import mavutil

import config

# ============================================================
# Tuning
# ============================================================
MAX_FOLLOW_DIST    = 10.0  # m — fly toward tag if within this range
MAX_LAND_DIST      = 5.0   # m — trigger LAND only when this close
LAND_CENTER_DEG    = 5.0   # deg — must be this centered to LAND
LAND_TRIGGER_TIME  = 1.5   # sec — must stay centered this long
ABORT_LOST_TIMEOUT = 10.0  # sec — abort to LOITER if tag lost this long

KP_FOLLOW          = 1.5   # m/s per radian of angle error
MAX_FOLLOW_VEL     = 0.6   # m/s — velocity cap for safety

# ArduCopter flight modes
STABILIZE_MODE = 0
AUTO_MODE      = 3
GUIDED_MODE    = 4
LOITER_MODE    = 5
LAND_MODE      = 9
POSHOLD_MODE   = 16

# Modes the script can take over FROM (pilot-flown modes)
TAKEOVER_MODES = {LOITER_MODE, STABILIZE_MODE, AUTO_MODE, POSHOLD_MODE}

# States
STATE_IDLE      = "IDLE"
STATE_FOLLOWING = "FOLLOWING"
STATE_LANDING   = "LANDING"


# ============================================================
# Camera
# ============================================================
def open_camera():
    cam = Picamera2()
    cam.configure(cam.create_video_configuration(
        main={"format": "RGB888", "size": (config.CAP_W, config.CAP_H)},
        controls={"FrameRate": config.FRAMERATE}
    ))
    cam.start(); time.sleep(1.0)
    return cam


# ============================================================
# MAVLink
# ============================================================
def connect_mav():
    m = mavutil.mavlink_connection(
        config.MAV_CONNECTION, baud=config.MAV_BAUD,
        source_system=1, source_component=191
    )
    print("Waiting for heartbeat...")
    m.wait_heartbeat()
    print(f"MAVLink connected (system={m.target_system})")
    return m


def send_landing_target(m, ax, ay, dist):
    m.mav.landing_target_send(
        int(time.time() * 1e6), 0,
        mavutil.mavlink.MAV_FRAME_BODY_FRD,
        ax, ay, dist, 0.0, 0.0
    )


def send_mode(m, custom_mode, label="MODE"):
    print(f"\n>>> Switching to {label} (mode={custom_mode})")
    m.mav.command_long_send(
        m.target_system, m.target_component,
        mavutil.mavlink.MAV_CMD_DO_SET_MODE, 0,
        mavutil.mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED,
        custom_mode, 0, 0, 0, 0, 0
    )
    ack = m.recv_match(type='COMMAND_ACK', blocking=True, timeout=2)
    if ack is not None and ack.result == 0:
        print(f">>> {label} ACCEPTED")
        return True
    print(f">>> {label} REJECTED ({ack})")
    return False


def send_velocity(m, vx, vy):
    """Send horizontal velocity (m/s) in body frame. vz=0 → maintain altitude."""
    vx = max(-MAX_FOLLOW_VEL, min(MAX_FOLLOW_VEL, vx))
    vy = max(-MAX_FOLLOW_VEL, min(MAX_FOLLOW_VEL, vy))
    m.mav.set_position_target_local_ned_send(
        0, m.target_system, m.target_component,
        mavutil.mavlink.MAV_FRAME_BODY_NED,
        0b110111000111,           # use vx, vy, vz; ignore everything else
        0, 0, 0,                  # position (ignored)
        vx, vy, 0.0,              # velocity body-frame m/s
        0, 0, 0,                  # acceleration (ignored)
        0, 0                      # yaw, yaw_rate (ignored)
    )


def update_armed_mode(m, current):
    result = current
    while True:
        hb = m.recv_match(type='HEARTBEAT', blocking=False)
        if hb is None: break
        if hb.get_srcComponent() == 1:
            armed = (hb.base_mode & 128) != 0
            result = (armed, hb.custom_mode)
    return result


# ============================================================
# Main
# ============================================================
def main():
    if not config.CALIBRATED:
        print("WARNING: calibration.json not found — using rough focal-length guess.")

    cam = open_camera()
    mav = connect_mav()

    det = Detector(
        families=config.TAG_FAMILY, nthreads=4,
        quad_decimate=config.QUAD_DECIMATE, refine_edges=1
    )
    cam_params = (config.FX, config.FY, config.CX, config.CY)

    interval = 1.0 / config.TARGET_RATE_HZ
    last_send = 0.0
    found = 0; notfound = 0

    state = STATE_IDLE
    tag_seen_start = None
    last_seen = 0.0
    armed_mode = (False, -1)

    print("Autonomous precision landing running...")

    while True:
        frame = cam.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        dets = det.detect(
            gray, estimate_tag_pose=True,
            camera_params=cam_params, tag_size=config.TAG_SIZE
        )

        armed_mode = update_armed_mode(mav, armed_mode)
        armed, current_mode = armed_mode
        now = time.time()

        # If pilot took over (mode no longer GUIDED/LAND), reset state
        if state == STATE_FOLLOWING and current_mode != GUIDED_MODE:
            print(f"\n>>> Pilot override (mode={current_mode}) — back to IDLE")
            state = STATE_IDLE; tag_seen_start = None
        elif state == STATE_LANDING and current_mode != LAND_MODE:
            print(f"\n>>> Pilot override during LAND (mode={current_mode})")
            state = STATE_IDLE; tag_seen_start = None

        # ----- No detection -----
        if not dets:
            notfound += 1
            if state in (STATE_FOLLOWING, STATE_LANDING) and \
               (now - last_seen) > ABORT_LOST_TIMEOUT:
                print(f"\n>>> Target lost {ABORT_LOST_TIMEOUT}s — aborting to LOITER")
                if send_mode(mav, LOITER_MODE, "LOITER"):
                    state = STATE_IDLE; tag_seen_start = None
            continue

        # ----- Process detection -----
        d = dets[0]
        tx, ty, tz = [float(x) for x in d.pose_t.flatten()]
        if tz <= 0: notfound += 1; continue

        forward = -ty; right = tx
        if config.SWAP_AXES:  forward, right = right, forward
        if config.FLIP_FWD:   forward = -forward
        if config.FLIP_RIGHT: right = -right

        angle_x = math.atan2(forward, tz)
        angle_y = math.atan2(right, tz)
        distance = float(np.linalg.norm(d.pose_t))
        offset_deg = math.hypot(math.degrees(angle_x), math.degrees(angle_y))

        found += 1; last_seen = now

        # LANDING_TARGET to FC (rate-limited)
        if now - last_send >= interval:
            send_landing_target(mav, angle_x, angle_y, distance)
            last_send = now
            print(
                f"id={d.tag_id} "
                f"x={math.degrees(angle_x):+5.1f} "
                f"y={math.degrees(angle_y):+5.1f} deg "
                f"d={distance:4.2f}m "
                f"off={offset_deg:4.1f} "
                f"armed={armed} mode={current_mode} state={state}"
            )

        # ----- State machine -----
        if not armed:
            continue   # safety: never act when disarmed

        close_to_land = distance < MAX_LAND_DIST
        in_follow_range = distance < MAX_FOLLOW_DIST
        centered = offset_deg < LAND_CENTER_DEG

        if state == STATE_IDLE:
            # Tag in view + drone is in a pilot-flyable mode → take over
            if in_follow_range and current_mode in TAKEOVER_MODES:
                print(f"\n>>> TAG DETECTED at {distance:.2f}m — taking over (GUIDED)")
                if send_mode(mav, GUIDED_MODE, "GUIDED"):
                    state = STATE_FOLLOWING
                    tag_seen_start = None

        elif state == STATE_FOLLOWING:
            # Drone is in GUIDED — send velocity commands toward tag
            vx = KP_FOLLOW * angle_x   # forward (+) / back (-)
            vy = KP_FOLLOW * angle_y   # right (+) / left (-)
            send_velocity(mav, vx, vy)

            # Check if centered enough + close enough to LAND
            if centered and close_to_land:
                if tag_seen_start is None:
                    tag_seen_start = now
                elif now - tag_seen_start >= LAND_TRIGGER_TIME:
                    print(f"\n>>> CENTERED ({offset_deg:.1f}°, {distance:.1f}m) — LAND")
                    if send_mode(mav, LAND_MODE, "LAND"):
                        state = STATE_LANDING
                        tag_seen_start = None
            else:
                tag_seen_start = None

        # STATE_LANDING: Cube handles descent + final centering


if __name__ == "__main__":
    main()
