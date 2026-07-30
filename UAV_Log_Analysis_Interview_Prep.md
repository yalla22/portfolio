# UAV Log Analysis — Interview Prep (Engineer, Flight Data Analysis)

Your edge: you **built a flight-log diagnostic platform** (Flight Log Analyzer) + a **precision-landing system on real ArduPilot hardware**. This role IS your project. Lead with that.

---

## 0. Framing the experience gap (2–5 yrs asked, you have <1)
You got the interview because the project resonated — so **anchor everything to hands-on evidence**:
> "I built a full flight-log diagnostics platform: a from-scratch ArduPilot DataFlash (.bin) parser decoding 50+ message types, and a phased engine running 50+ automated checks across power, IMU/vibration, GPS, EKF, compass, RC, and failsafes — classifying each PASS/WARN/FAIL and inferring probable crash cause. On the hardware side, I ran real ArduPilot flights for autonomous precision landing over MAVLink. So I've been doing UAV log analysis end-to-end, just as a builder rather than by tenure."

Turn "junior" into "I automated what analysts do manually."

---

## 1. Log formats & tools (must be fluent)
| | ArduPilot | PX4 |
|---|---|---|
| Onboard log | **DataFlash `.bin`** (self-describing: FMT messages define fields) | **ULog `.ulg`** |
| Telemetry log | `.tlog` (MAVLink stream) | `.tlog` |
| Primary tools | **Mission Planner** (Review a Log / auto-analysis), **MAVExplorer** (MAVProxy), **UAV Log Viewer** (web: plotbeta/UAVLogViewer), `pymavlink` (`DFReader`) | **Flight Review** (review.px4.io / logs.px4.io), `pyulog`, QGroundControl, FlightPlot |
| Python | `pymavlink.mavutil`, `DFReader_binary`, pandas, matplotlib | `pyulog`, pandas |

Know: **self-describing format** = each `.bin` begins with FMT messages that declare every message type's fields, so a parser reads the schema then the data (this is exactly what you built).

---

## 2. Key log messages & what each tells you (ArduPilot)
| Message | What it is | What you check |
|---|---|---|
| **ATT** | Attitude | DesRoll vs Roll, DesPitch vs Pitch, DesYaw vs Yaw → tracking error / loss of control |
| **RATE** | Rate controller | desired vs achieved roll/pitch/yaw rates, output saturation |
| **CTUN** | Control/throttle tuning | ThrOut, ThrHov (hover throttle), climb rate, alt desired vs actual |
| **GPS** | GNSS | Status (fix type), NSats, HDOP, Spd, position |
| **IMU / ACC / GYR** | Inertial sensors | AccX/Y/Z, GyrX/Y/Z, health, temperature |
| **VIBE** | Vibration | VibeX/Y/Z (m/s²), **Clip0/1/2** (accel clipping counters) |
| **MAG** | Compass | MagX/Y/Z, field magnitude, offsets, motor interference |
| **BARO** | Barometer | Alt, pressure, climb |
| **BAT / POWR** | Power | Volt, Curr, CurrTot, **POWR.Vcc** (board 5V rail → brownout), VServo |
| **RCIN / RCOU** | RC in / motor out | pilot inputs (RCIN), **motor PWM outputs C1–C8 (RCOU)** → motor balance |
| **ESC** | ESC telemetry | RPM, Volt, Curr, Temperature per ESC |
| **NKF/XKF (EKF2/3)** | State estimator | innovations & **variances**: velVar, posVar, hgtVar, magVar, tasVar |
| **MODE** | Flight mode | mode changes and *why* (reason) |
| **ERR** | Subsystem errors | error subsystem + code (failsafes, EKF, GPS glitch, crash) |
| **EV** | Events | arm/disarm, autotune, takeoff, land complete |
| **MSG** | Text messages | firmware version, prearm messages, autopilot notes |
| **PM** | Performance | CPU load, long loops (scheduling overruns) |

---

## 3. Anomaly diagnosis playbook (symptom → log signature → root cause)
**Vibration**
- Signature: VIBE > 30 m/s² (concerning), > 60 (bad); **Clip0/1/2 counters increasing**.
- Effects: EKF position/altitude errors, altitude climb/descent, "flyaways," toilet-bowling.
- Causes/fixes: unbalanced props, loose/hard-mounted FC, damaged motor bearings → balance props, soft-mount (gel/foam), set gyro filter / harmonic notch filter (INS_HNTCH).

**GPS / GNSS**
- Signature: NSats drop (<6), HDOP spike (>2), GPS.Status downgrade, position jumps, EKF posVar/velVar spikes, ERR GPS glitch.
- Effects: LOITER/AUTO drift, GPS failsafe, RTL.
- EW/GNSS-denied: sudden simultaneous loss across sats, spoofing = plausible-but-wrong position; mitigations = GPS failsafe, non-GPS nav (optical flow, visual/beacon), EK3 source switching.

**Compass / magnetometer**
- Signature: high compass variance, MagField magnitude far from expected, offsets large, field scales with throttle/current (**motor interference**).
- Effects: **toilet-bowling** (circling in LOITER), yaw drift, bad heading, EKF yaw reset.
- Fixes: recalibrate, COMPASS_MOT (motor compensation), move compass away from power wires, use external compass.

**Power / brownout**
- Signature: **BAT.Volt sag** under **BAT.Curr** spikes; **POWR.Vcc** dip (<4.5 V) → brownout/reboot; battery failsafe ERR; log ends abruptly mid-flight.
- Causes: sagging/old battery, undersized BEC, loose connector, high current draw.

**ESC / motor**
- Signature: **RCOU imbalance** — one motor consistently commanded much higher/lower than the others to hold attitude → failing motor/ESC/prop or arm misalignment; then ATT DesRoll vs Roll diverges → crash. ESC telemetry: RPM not tracking command, temp climbing.
- Classic: on a quad, opposite motors pair up; a single high output points to that arm.

**RC / comms**
- Signature: RCIN dropout, RSSI drop, THR_FS / radio failsafe ERR, mode change to RTL/LAND on link loss.

**Control / tuning**
- Signature: sustained oscillation in ATT/RATE (actual chases desired with ringing), motor outputs oscillating, high-frequency wobble.
- Causes: PIDs too high (esp. rate D), or too low (sloppy tracking), needs Autotune; filter not set for frame.

---

## 4. Crash investigation methodology (say this out loud in the interview)
1. **Context:** aircraft, frame, firmware version (MSG), mission, mode, phase of flight.
2. **What did the autopilot say?** Scan **ERR**, **EV**, **MODE** changes — find the first anomaly and its timestamp.
3. **Control breakdown point:** ATT DesRoll/Roll (and pitch/yaw) — *when* did actual stop following desired?
4. **Work outward from that timestamp:**
   - Motors: RCOU saturation/imbalance?
   - Sensors: VIBE/clipping, IMU, GPS, MAG, EKF variances?
   - Power: BAT/POWR sag or brownout?
5. **Timeline correlation:** separate **root cause** (what happened *first*) from **symptom** (what followed). E.g. voltage sag → motor can't hold → attitude diverges → crash.
6. **Report:** findings + **CAPA** (corrective: fix this airframe; preventive: process/param change so the fleet doesn't repeat it).

> Golden line: *"I always ask what happened first — the autopilot usually logs the symptom loudly, but the root cause is a few hundred milliseconds earlier in a different subsystem."*

---

## 5. Flight dynamics & control (fundamentals they may probe)
- Multicopter axes: **roll / pitch / yaw**; how motor mixing produces torque/thrust.
- **Cascaded PID:** outer **angle (P)** loop → inner **rate (PID)** loop → motor outputs. ArduCopter: ATC_RAT_* (rate), ATC_ANG_* (angle).
- Hover throttle (CTUN.ThrHov), thrust-to-weight, why underpowered craft can't recover.
- Flight modes: STABILIZE, ALT_HOLD, LOITER, POSHOLD, AUTO, GUIDED, RTL, LAND — which need GPS.
- **EKF** = Extended Kalman Filter fusing IMU+GPS+baro+mag into position/velocity/attitude; **innovation** = measurement − prediction; **variance** = confidence; high variance → failsafe/lane switch.

---

## 6. Parameter tuning essentials
- Rate PIDs: ATC_RAT_RLL/PIT/YAW_P/I/D; angle P: ATC_ANG_*.
- **Autotune** mode → auto-derives PIDs.
- Filters: INS_GYRO_FILTER, **harmonic notch (INS_HNTCH_*)** driven by throttle or ESC RPM to kill motor vibration.
- Failsafes: FS_THR_*, BATT_LOW/CRT, FS_EKF_THRESH, FS_GCS.
- Sensor/EKF: EK3_SRCn_* (GPS/optical-flow/beacon source selection for GNSS-denied), COMPASS_*, GPS_*.

---

## 7. GNSS-denied & EW (preferred — bonus points)
- **Jamming** in logs: broadband loss → NSats collapse, HDOP spikes, GPS drops fix across all sats at once.
- **Spoofing:** GPS reports a *confident but wrong* position; cross-check against IMU dead-reckoning / EKF innovations that suddenly diverge.
- Resilience: GPS failsafe, **EK3 source switching** to optical flow / visual odometry / RF beacons, inertial nav coasting, RTK for integrity.
- Tie-in: your AprilTag precision-landing = a **vision-based, GPS-independent** positioning method — mention it here.

---

## 8. Your projects — talking points
**Flight Log Analyzer (your headline):**
- Self-describing DataFlash parser: reads FMT schema, then decodes 50+ message types via byte-level struct; reconstructs real IST time from GPS week/ms.
- Phased 50+ check engine → PASS/WARN/FAIL across power, IMU/vibration, GPS, EKF, compass, RC, failsafes; infers probable crash cause.
- Auto PDF report (flight path, sensor charts, color-coded tables).
- **Dual-format (your differentiator):** ONE analyzer ingests **both** Pixhawk/ArduPilot DataFlash `.bin` **and** JIYI K++ (agri/commercial) logs, with **automatic format detection via magic-byte sniffing**, then normalizes both into a common internal schema so the same diagnostic engine runs on either. (Pixhawk = hardware running ArduPilot/PX4; JIYI = separate proprietary agri-drone controller.)
- Be ready to whiteboard: "how would you detect a failing motor from a log?" → RCOU imbalance logic you likely already coded.

**Precision Landing:** real ArduPilot flights, MAVLink at 20 Hz, companion computer, LANDING_TARGET, GPS-NAV vs visual modes, touchdown detection, failsafes — proves hands-on flight experience, not just desk analysis.

---

## 9. Likely questions + how to answer
1. **"Walk me through investigating a crash from a .bin file."** → Section 4 methodology.
2. **"Drone flipped on takeoff — what do you check?"** → motor order/spin direction, frame type, RCOU at arm, prop-in-wrong-place, ATT divergence immediately after arm.
3. **"Copter toilet-bowls in LOITER — why?"** → compass (interference/bad cal) or GPS glitch; check MAG variance & field-vs-throttle, GPS NSats/HDOP.
4. **"How do you spot a failing motor/ESC?"** → RCOU imbalance to hold attitude, ESC RPM/temp telemetry, corresponding vibration.
5. **"High vibration — effects & fixes?"** → clipping → EKF alt/pos errors; balance props, soft-mount, notch filter.
6. **"Signs of voltage sag / brownout?"** → BAT.Volt vs Curr, POWR.Vcc dip, abrupt log end, battery failsafe ERR.
7. **"ArduPilot .bin vs PX4 ULog?"** → formats + tools (Section 1).
8. **"What is the EKF and what do variances tell you?"** → Section 5.
9. **"GPS jamming vs spoofing in logs?"** → Section 7.
10. **"You have 200 logs — how do you find fleet-wide failure trends?"** → parse to a database (you did this), aggregate by failure type, track reliability metrics/MTBF, dashboard — ties to the "maintain a database of flight logs & reliability metrics" responsibility.

---

## 10. Behavioral / fit
- **Why this role:** "I built a log analyzer because I love finding *why* a flight failed — this role is that, full-time, on tactical platforms."
- **Teamwork:** you'd feed root causes to hardware/integration/flight-test — give an example of collaboration from Marut.
- **Attention to detail / rigor:** crash analysis is forensic; show a methodical mindset.
- Immediate joiner; open to relocation.

## 11. Smart questions to ask them
- Which platforms/firmware (ArduPilot vs PX4, which frames)?
- Current log-analysis workflow and tools — is there automation, or manual review?
- Biggest recurring reliability issues on the fleet?
- How deep is the GNSS-denied / EW work?
- What does success look like in the first 6 months?

---

## 12. One-page number cheat sheet
- **Vibration:** <15 great · 15–30 OK · 30–60 concerning · >60 bad. **Clipping should be 0.**
- **GPS:** HDOP <1.0 great, <2.0 OK; NSats ≥6 min, ≥10 good. Status: 3=3D, 4=DGPS, 5=RTK float, 6=RTK fixed.
- **EKF variances (0–1):** <0.5 good · 0.5–0.8 marginal · >0.8 bad · ≥1.0 failsafe.
- **Board voltage (POWR.Vcc):** ~5.0 V; <4.5 V → brownout risk.
- **Attitude:** small Des-vs-actual tracking error normal; large sustained divergence = loss of control.
- **RCOU:** balanced ≈ similar across motors; one persistently high = that arm's motor/ESC/prop.

**Study order if time-limited:** §4 methodology → §2 messages → §3 playbook → §12 numbers → §8 your project → §7 EW.
