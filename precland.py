#!/usr/bin/env python3
"""
Precision Landing Companion
- Triggers LAND ONLY when armed and in LOITER, STABILIZE, or AUTO mode
- Tag must be centered + close for LAND_TRIGGER_TIME seconds
- Auto-aborts to LOITER if target lost during landing
- ACK verification on every mode change
- Filters heartbeat to autopilot component only
"""
import time
import math
import numpy as np
import cv2

from picamera2 import Picamera2
from pupil_apriltags import Detector
from pymavlink import mavutil

import config

# ============================================================
# Auto-LAND parameters
# ============================================================
LAND_TRIGGER_TIME  = 1.5   # sec — tag must stay centered + close this long
MAX_TRIGGER_DIST   = 5.0   # m  — only trigger inside this range
MAX_TRIGGER_ANGLE  = 5.0   # deg — must be this centered (off-nadir)

# ArduCopter flight modes
STABILIZE_MODE = 0
AUTO_MODE      = 3
LOITER_MODE    = 5
LAND_MODE      = 9

# Trigger LAND only from these three modes
SAFE_MODES = {LOITER_MODE, STABILIZE_MODE, AUTO_MODE}

# Auto-abort if target lost during landing
ABORT_LOST_TIMEOUT = 2.0


# ============================================================
# Camera
# ============================================================
def open_camera():
    cam = Picamera2()
    cam.configure(cam.create_video_configuration(
        main={"format": "RGB888", "size": (config.CAP_W, config.CAP_H)},
        controls={"FrameRate": config.FRAMERATE}
    ))
    cam.start()
    time.sleep(1.0)
    return cam


# ============================================================
# MAVLink
# ============================================================
def connect_mav():
    m = mavutil.mavlink_connection(
        config.MAV_CONNECTION,
        baud=config.MAV_BAUD,
        source_system=1,
        source_component=191
    )
    print("Waiting for heartbeat...")
    m.wait_heartbeat()
    print(f"MAVLink connected (system={m.target_system})")
    return m


def send_landing_target(m, ax, ay, dist):
    m.mav.landing_target_send(
        int(time.time() * 1e6),
        0,
        mavutil.mavlink.MAV_FRAME_BODY_FRD,
        ax, ay, dist,
        0.0, 0.0
    )


def send_mode(m, custom_mode, label="MODE"):
    print(f"\n>>> Switching to {label} (custom_mode={custom_mode})")
    m.mav.command_long_send(
        m.target_system,
        m.target_component,
        mavutil.mavlink.MAV_CMD_DO_SET_MODE,
        0,
        mavutil.mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED,
        custom_mode,
        0, 0, 0, 0, 0
    )
    ack = m.recv_match(type='COMMAND_ACK', blocking=True, timeout=2)
    if ack is not None and ack.result == 0:
        print(f">>> {label} ACCEPTED")
        return True
    print(f">>> {label} REJECTED ({ack})")
    return False


def send_land_mode(m):
    return send_mode(m, LAND_MODE, "LAND")


def update_armed_mode(m, current):
    """Drain heartbeats, return latest from autopilot component (1) only."""
    result = current
    while True:
        hb = m.recv_match(type='HEARTBEAT', blocking=False)
        if hb is None:
            break
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
        families=config.TAG_FAMILY,
        nthreads=4,
        quad_decimate=config.QUAD_DECIMATE,
        refine_edges=1
    )
    cam_params = (config.FX, config.FY, config.CX, config.CY)

    interval = 1.0 / config.TARGET_RATE_HZ
    last_send = 0.0
    found = 0
    notfound = 0

    tag_seen_start = None
    land_sent = False
    last_seen = 0.0
    armed_mode = (False, -1)

    print("Precision landing running...")

    while True:
        frame = cam.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        dets = det.detect(
            gray,
            estimate_tag_pose=True,
            camera_params=cam_params,
            tag_size=config.TAG_SIZE
        )

        armed_mode = update_armed_mode(mav, armed_mode)
        armed, current_mode = armed_mode
        now = time.time()

        # No detection
        if not dets:
            notfound += 1
            if land_sent and (now - last_seen) > ABORT_LOST_TIMEOUT:
                print(f"\n>>> Target lost for {ABORT_LOST_TIMEOUT:.1f}s — aborting to LOITER")
                if send_mode(mav, LOITER_MODE, "LOITER"):
                    land_sent = False
                    tag_seen_start = None
            continue

        # Process detection
        d = dets[0]
        tx, ty, tz = [float(x) for x in d.pose_t.flatten()]
        if tz <= 0:
            notfound += 1
            continue

        forward = -ty
        right = tx
        if config.SWAP_AXES:
            forward, right = right, forward
        if config.FLIP_FWD:
            forward = -forward
        if config.FLIP_RIGHT:
            right = -right

        angle_x = math.atan2(forward, tz)
        angle_y = math.atan2(right, tz)
        distance = float(np.linalg.norm(d.pose_t))

        found += 1
        last_seen = now

        # Send LANDING_TARGET (rate-limited)
        if now - last_send >= interval:
            send_landing_target(mav, angle_x, angle_y, distance)
            last_send = now
            print(
                f"id={d.tag_id} "
                f"x={math.degrees(angle_x):+5.1f} "
                f"y={math.degrees(angle_y):+5.1f} deg "
                f"d={distance:4.2f}m "
                f"FOUND={found} NOTFOUND={notfound} "
                f"armed={armed} mode={current_mode} "
                f"land_sent={land_sent}"
            )

        # Auto-LAND trigger — only from LOITER, STABILIZE, or AUTO modes
        if land_sent:
            continue

        offset_deg = math.hypot(
            math.degrees(angle_x),
            math.degrees(angle_y)
        )

        in_safe_mode = armed and (current_mode in SAFE_MODES)
        close_enough = distance < MAX_TRIGGER_DIST
        centered     = offset_deg < MAX_TRIGGER_ANGLE

        if in_safe_mode and close_enough and centered:
            if tag_seen_start is None:
                tag_seen_start = now
            elif now - tag_seen_start >= LAND_TRIGGER_TIME:
                print("\n>>> APRILTAG LOCKED")
                print(">>> Switching to LAND mode")
                if send_land_mode(mav):
                    land_sent = True
        else:
            tag_seen_start = None


if __name__ == "__main__":
    main()
