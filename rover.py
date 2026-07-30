#!/usr/bin/env python3
"""
Complete Moving Platform Precision Landing
============================================
- Pilot engages by switching to GUIDED
- Long-range: GPS-based navigation toward rover
- Mid-range: starts descending as drone closes
- Close-range: AprilTag visual precision landing
- Touchdown: auto-disarm

BENCH MODE: set environment variable BENCH=1 to:
  - Force vz=0 (no descent, hover only)
  - Disable touchdown auto-disarm
Run flight mode:  python3 precland.py
Run bench mode:   BENCH=1 python3 precland.py
"""
import time, math, os
from dataclasses import dataclass
from enum import Enum

import numpy as np, cv2
from picamera2 import Picamera2
from pupil_apriltags import Detector
from pymavlink import mavutil

import config


# =========================================================================
# Bench-test safety flag (read from environment)
# =========================================================================
BENCH_MODE = os.environ.get('BENCH', '0') == '1'


# =========================================================================
class C:
    DRONE_SYSID         = 1
    ROVER_SYSID         = 2

    # Visual engagement
    CENTER_DEG          = 5.0
    ABORT_LOST_TIMEOUT  = 15.0
    ROVER_STALE_SEC     = 2.0

    # GPS navigation
    GPS_NAV_SPEED       = 2.0     # m/s — max speed during GPS approach
    GPS_CLOSE_DIST      = 20.0    # m — start descending below this
    GPS_VISUAL_DIST     = 8.0     # m — by here, tag should be visible
    GPS_DECEL_DIST      = 3.0     # m — slow down within this of target

    # Descent profile
    APPROACH_HEIGHT     = 5.0
    APPROACH_SPEED      = 0.3
    LAND_SPEED          = 0.5
    OFFCENTER_SPEED     = 0.10

    # GPS-phase descent rates
    GPS_DESCENT_FAR     = 0.0     # > GPS_CLOSE_DIST: no descent
    GPS_DESCENT_MID     = 0.2     # GPS_VISUAL_DIST to GPS_CLOSE_DIST: slow
    GPS_DESCENT_NEAR    = 0.3     # < GPS_VISUAL_DIST: faster

    # Touchdown
    TOUCHDOWN_ALT       = 0.30
    TOUCHDOWN_CLIMB     = 0.10
    TOUCHDOWN_TIME      = 1.0
    TOUCHDOWN_LAND_SPD  = 0.6

    # Control
    KP_XY               = 1.5
    MAX_VEL_XY          = 2.0
    MAX_VEL_Z           = 0.8


# =========================================================================
class State(Enum):
    IDLE     = "IDLE"
    APPROACH = "APPROACH"
    LANDED   = "LANDED"


@dataclass
class RoverState:
    last_seen: float = 0.0
    vx_ned: float = 0.0
    vy_ned: float = 0.0
    vz_ned: float = 0.0
    lat: int = 0
    lon: int = 0
    def is_fresh(self, now): return (now - self.last_seen) < C.ROVER_STALE_SEC
    def has_position(self): return self.lat != 0 and self.lon != 0


@dataclass
class DroneState:
    armed: bool = False
    mode: int = -1
    yaw: float = 0.0
    altitude_m: float = 0.0
    climb_rate: float = 0.0
    lat: int = 0
    lon: int = 0
    def has_position(self): return self.lat != 0 and self.lon != 0


@dataclass
class TagState:
    detected: bool = False
    last_seen: float = 0.0
    angle_x: float = 0.0
    angle_y: float = 0.0
    distance: float = 0.0
    offset_deg: float = 0.0
    @property
    def centered(self): return self.offset_deg < C.CENTER_DEG


# =========================================================================
# MAVLink I/O
# =========================================================================
def connect_mav():
    m = mavutil.mavlink_connection(
        config.MAV_CONNECTION, baud=config.MAV_BAUD,
        source_system=1, source_component=191)
    print("Waiting for heartbeat...")
    m.wait_heartbeat()
    print(f"MAVLink connected (system={m.target_system})")
    return m


def drain_messages(m, drone: DroneState, rover: RoverState):
    while True:
        msg = m.recv_match(blocking=False)
        if msg is None: break
        mtype, sys, comp = msg.get_type(), msg.get_srcSystem(), msg.get_srcComponent()

        if sys == C.DRONE_SYSID and comp == 1:
            if mtype == 'HEARTBEAT':
                drone.armed = (msg.base_mode & 128) != 0
                drone.mode = msg.custom_mode
            elif mtype == 'ATTITUDE':
                drone.yaw = msg.yaw
            elif mtype == 'VFR_HUD':
                drone.altitude_m = msg.alt
                drone.climb_rate = msg.climb
            elif mtype == 'GLOBAL_POSITION_INT':
                drone.lat = msg.lat
                drone.lon = msg.lon

        elif sys == C.ROVER_SYSID and mtype == 'GLOBAL_POSITION_INT':
            rover.last_seen = time.time()
            rover.vx_ned = msg.vx / 100.0
            rover.vy_ned = msg.vy / 100.0
            rover.vz_ned = msg.vz / 100.0
            rover.lat = msg.lat
            rover.lon = msg.lon


def send_landing_target(m, t: TagState):
    m.mav.landing_target_send(
        int(time.time()*1e6), 0,
        mavutil.mavlink.MAV_FRAME_BODY_FRD,
        t.angle_x, t.angle_y, t.distance, 0.0, 0.0)


def send_velocity_body(m, vx, vy, vz):
    vx = max(-C.MAX_VEL_XY, min(C.MAX_VEL_XY, vx))
    vy = max(-C.MAX_VEL_XY, min(C.MAX_VEL_XY, vy))
    vz = max(-C.MAX_VEL_Z,  min(C.MAX_VEL_Z,  vz))
    m.mav.set_position_target_local_ned_send(
        0, m.target_system, m.target_component,
        mavutil.mavlink.MAV_FRAME_BODY_NED,
        0b110111000111,
        0, 0, 0, vx, vy, vz, 0, 0, 0, 0, 0)


def disarm(m):
    print(">>> DISARM (force)")
    m.mav.command_long_send(
        m.target_system, m.target_component,
        mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0,
        0, 21196, 0, 0, 0, 0, 0)


# =========================================================================
# GPS math
# =========================================================================
def gps_distance_bearing(lat1_e7, lon1_e7, lat2_e7, lon2_e7):
    """Haversine distance + bearing from point 1 to point 2.
       Returns (distance_m, bearing_rad). Bearing 0 = North, π/2 = East."""
    R = 6371000.0
    lat1 = math.radians(lat1_e7 / 1e7)
    lat2 = math.radians(lat2_e7 / 1e7)
    dlat = lat2 - lat1
    dlon = math.radians((lon2_e7 - lon1_e7) / 1e7)

    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    distance = 2 * R * math.asin(math.sqrt(a))

    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(dlon)
    bearing = math.atan2(x, y)
    return distance, bearing


# =========================================================================
# Control law
# =========================================================================
def rover_vel_body(rover: RoverState, yaw_rad: float):
    """Rover NED velocity → drone body frame."""
    c, s = math.cos(yaw_rad), math.sin(yaw_rad)
    return (rover.vx_ned*c + rover.vy_ned*s,
            -rover.vx_ned*s + rover.vy_ned*c)


def gps_nav_velocity(rover, drone):
    """Body-frame velocity to fly toward rover GPS, with rover velocity FF.
       Returns (vx_body, vy_body, distance_m)."""
    dist, bearing = gps_distance_bearing(
        drone.lat, drone.lon, rover.lat, rover.lon)
    nav_speed = min(C.GPS_NAV_SPEED, max(0.3, dist - C.GPS_DECEL_DIST))
    vN = nav_speed * math.cos(bearing) + rover.vx_ned
    vE = nav_speed * math.sin(bearing) + rover.vy_ned
    c, s = math.cos(drone.yaw), math.sin(drone.yaw)
    vx = vN * c + vE * s
    vy = -vN * s + vE * c
    return vx, vy, dist


def descent_visual(altitude, centered):
    """Descent rate when tag is visible."""
    if altitude < C.TOUCHDOWN_ALT:
        return C.TOUCHDOWN_LAND_SPD
    if altitude < C.APPROACH_HEIGHT:
        return C.LAND_SPEED if centered else C.OFFCENTER_SPEED
    return C.APPROACH_SPEED if centered else 0.2


def descent_gps(distance_to_rover, altitude):
    """Descent rate during GPS approach (no visual)."""
    if altitude < C.TOUCHDOWN_ALT:
        return C.TOUCHDOWN_LAND_SPD
    if distance_to_rover > C.GPS_CLOSE_DIST:
        return C.GPS_DESCENT_FAR
    if distance_to_rover > C.GPS_VISUAL_DIST:
        return C.GPS_DESCENT_MID
    return C.GPS_DESCENT_NEAR


def process_detection(d, tag: TagState, now):
    tx, ty, tz = [float(x) for x in d.pose_t.flatten()]
    if tz <= 0: return False
    fwd, right = -ty, tx
    if config.SWAP_AXES:  fwd, right = right, fwd
    if config.FLIP_FWD:   fwd = -fwd
    if config.FLIP_RIGHT: right = -right
    tag.angle_x = math.atan2(fwd, tz)
    tag.angle_y = math.atan2(right, tz)
    tag.distance = float(np.linalg.norm(d.pose_t))
    tag.offset_deg = math.hypot(math.degrees(tag.angle_x), math.degrees(tag.angle_y))
    tag.detected = True
    tag.last_seen = now
    return True


# =========================================================================
# Main
# =========================================================================
def main():
    # ----- Bench-mode banner (printed ONCE at startup) -----
    if BENCH_MODE:
        print("=" * 60)
        print("  BENCH MODE — vz forced to 0, touchdown disarm DISABLED")
        print("  (set BENCH=0 or unset BENCH for flight mode)")
        print("=" * 60)

    if not config.CALIBRATED:
        print("WARNING: calibration.json missing")

    cam = Picamera2()
    cam.configure(cam.create_video_configuration(
        main={"format":"RGB888","size":(config.CAP_W, config.CAP_H)},
        controls={"FrameRate": config.FRAMERATE}))
    cam.start(); time.sleep(1)

    mav = connect_mav()
    det = Detector(families=config.TAG_FAMILY, nthreads=4,
                   quad_decimate=config.QUAD_DECIMATE, refine_edges=1)
    cam_params = (config.FX, config.FY, config.CX, config.CY)

    drone, rover, tag = DroneState(), RoverState(), TagState()
    state = State.IDLE
    touchdown_start = None
    last_send = 0.0
    interval = 1.0 / config.TARGET_RATE_HZ
    found = notfound = 0

    GUIDED_MODE = 4

    print(f"Moving-platform precision landing — pilot-engaged via GUIDED")

    while True:
        frame = cam.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        dets = det.detect(gray, estimate_tag_pose=True,
                          camera_params=cam_params, tag_size=config.TAG_SIZE)

        drain_messages(mav, drone, rover)
        now = time.time()

        if dets and process_detection(dets[0], tag, now):
            found += 1
        else:
            tag.detected = False
            notfound += 1

        if tag.detected and now - last_send >= interval:
            send_landing_target(mav, tag)
            last_send = now

        # =============================================================
        # STATE MACHINE
        # =============================================================

        if state == State.IDLE:
            if drone.armed and drone.mode == GUIDED_MODE:
                print(f"\n>>> Pilot engaged GUIDED — script taking over")
                state = State.APPROACH
                touchdown_start = None

        elif state == State.APPROACH:
            # Pilot exited GUIDED → return control
            if drone.mode != GUIDED_MODE:
                print(f"\n>>> Pilot disengaged (mode={drone.mode}) → IDLE")
                state = State.IDLE
                touchdown_start = None
                continue

            # Decide nav method
            tag_visible    = tag.detected
            tag_recent     = (now - tag.last_seen) < 2.0
            gps_available  = (rover.is_fresh(now) and rover.has_position()
                              and drone.has_position())

            # --------------------------------------------
            # MODE A: VISUAL (tag is being detected NOW)
            # --------------------------------------------
            if tag_visible:
                if rover.is_fresh(now):
                    rv_x, rv_y = rover_vel_body(rover, drone.yaw)
                else:
                    rv_x, rv_y = 0.0, 0.0
                vx = rv_x + C.KP_XY * tag.angle_x
                vy = rv_y + C.KP_XY * tag.angle_y
                vz = descent_visual(drone.altitude_m, tag.centered)
                nav_label = "VISUAL"
                dist = tag.distance

            # --------------------------------------------
            # MODE B: GPS-NAV (no tag, but we know where rover is)
            # --------------------------------------------
            elif gps_available:
                vx, vy, dist = gps_nav_velocity(rover, drone)
                vz = descent_gps(dist, drone.altitude_m)
                nav_label = "GPS-NAV"

            # --------------------------------------------
            # MODE C: BLIND HOVER (no tag, no rover GPS)
            # --------------------------------------------
            else:
                vx, vy, vz = 0.0, 0.0, 0.0
                nav_label = "HOVER"
                dist = -1
                if (now - tag.last_seen) > C.ABORT_LOST_TIMEOUT and \
                   not rover.is_fresh(now):
                    print(f"\n>>> Lost everything {C.ABORT_LOST_TIMEOUT}s — pilot must act")

            # ===== BENCH SAFETY: force hover, no descent =====
            if BENCH_MODE:
                vz = 0.0
            # =================================================

            send_velocity_body(mav, vx, vy, vz)

            # Log status (rate-limited)
            if now - last_send >= interval:
                last_send = now
                bench_tag = " [BENCH]" if BENCH_MODE else ""
                print(
                    f"{nav_label:8s}{bench_tag} dist={dist:5.1f}m alt={drone.altitude_m:4.2f}m "
                    f"climb={drone.climb_rate:+.2f} vz={vz:+.2f} "
                    f"tag={tag_visible} rover={rover.is_fresh(now)} "
                    f"vN={rover.vx_ned:+.2f} vE={rover.vy_ned:+.2f}"
                )

            # ===== Touchdown detection — DISABLED in bench =====
            if not BENCH_MODE:
                if drone.altitude_m < C.TOUCHDOWN_ALT:
                    if touchdown_start is None:
                        touchdown_start = now
                        print(">>> Below touchdown threshold — committed")
                    elif (now - touchdown_start) > C.TOUCHDOWN_TIME and \
                         abs(drone.climb_rate) < C.TOUCHDOWN_CLIMB:
                        print(">>> TOUCHDOWN settled — DISARM")
                        disarm(mav)
                        state = State.LANDED
                else:
                    touchdown_start = None
            # ===================================================

        elif state == State.LANDED:
            time.sleep(1.0)
            if not drone.armed:
                state = State.IDLE
                touchdown_start = None


if __name__ == "__main__":
    main()
