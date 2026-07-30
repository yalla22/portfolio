# Flight Log Analyzer — End-to-End Deep Dive (for interview)

Based on the real code at `C:\Users\yalla\Flight-Log-Analyzer`. Know this cold — it's *your* project and the interview will drill into it.

---

## 1. What it is (30-sec pitch)
A full-stack web tool that ingests raw drone flight logs from **two different flight-controller ecosystems — Pixhawk/ArduPilot and JIYI K++ (agricultural)** — auto-detects the format, and generates a professional **PDF health/diagnostics report** with a **two-phase, ~30-check engine** that classifies each finding PASS/WARN/FAIL and surfaces probable failure causes. Solo-built, ~7,200 lines. FastAPI backend + React/TypeScript frontend, containerized with Docker.

---

## 2. Architecture (say this as a flow)
```
React + TS + Vite + Tailwind (App.tsx)
   │  upload .bin/.log  (POST /analyze)
   ▼
FastAPI backend (main.py)
   │  validate: extension allow-list + 500 MB cap
   ▼
FORMAT DETECTION (magic bytes)
   ├─ 0xA3 0x95            → ArduPilot .bin  → ardupilot_report.py (direct parse)
   ├─ text (>80% printable)→ JIYI text log   → jiyi_report.py
   └─ 0x00 0xFF / 0x37 0xC8→ JIYI binary:
          ├─ first byte 0x37? → XOR-decrypt (key 0x37)
          ├─ binToLog.exe via `xvfb-run mono`  (bin → text)   [asyncio lock]
          └─ jiyi_report.py (parse text → PDF)
   ▼
ReportLab + Matplotlib → PDF  → FileResponse (+ BackgroundTask cleanup)
```

---

## 3. The JIYI XOR decryption (your standout story)
- JIYI **obfuscates its SD-card `.bin` logs with a single-byte XOR cipher, key `0x37`**.
- **How you found/verified it:** the encrypted file starts with bytes `0x37 0xC8`. XOR with `0x37` gives `0x00 0xFF` — which is exactly the **known plaintext JIYI message marker** (`JIYI_HEAD1=0x00, JIYI_HEAD2=0xFF`). That confirmed the whole file is XOR'd with `0x37`.
- **Implementation:** detect the `0x37` magic byte → `bytes(b ^ 0x37 for b in data)` over the whole file → then hand the decrypted `.bin` to the converter.
- **One-liner for the interview:** *"JIYI encrypts logs with a single-byte XOR (0x37). I spotted it because the encrypted header XORs cleanly to the known plaintext marker 0x00 0xFF, so I detect the 0x37 signature, XOR-decrypt the file, then run it through the binary-to-text converter."*

---

## 4. Why Mono + Xvfb + a lock (they will ask)
- **binToLog.exe** is a **Windows .NET** tool that converts JIYI binary → text. To run it on the Linux/Docker backend, it's invoked through **`mono`** (runs .NET on Linux) with **`xvfb-run`** (a virtual X display, because the exe expects a GUI/display even when headless).
- **asyncio lock (`_bintolog_lock`):** the converter reads/writes **fixed filenames** (`1.bin` → output `2`), so two concurrent uploads would clobber each other — the lock **serializes** conversions. (Honest weakness + fix: give each job a unique temp dir / queue so conversions can run in parallel.)

---

## 5. Parsing — self-describing binary (both ArduPilot & JIYI)
- Both formats begin messages with **FMT records (type `0x80`)** that declare each message's **name, format string, and column names** → the parser **reads the schema first**, then decodes every record.
- Decode: a `FORMAT_CHARS` map turns each format char into a `struct` code + byte size; `SCALARS` apply units (e.g. lat/lng `× 1e-7`, centi-units `× 0.01`); string types are ASCII-decoded.
- JIYI binary: scan the byte stream for `0x00 0xFF` markers, read the FMT table, decode each message by type id.
- **Robustness (real-world logs are messy):** timestamp sanity cap (`MAX_MS` = 4 h), range filters for impossible values (vibe > 200, volt outside 30–60 V for 12S, roll > 180°, alt outside −10…500 m), and **median/percentile instead of last value** (e.g. hover PWM), because JIYI logs have corrupt bursts at the end.

---

## 6. The diagnostic engine (~30 checks, 2 phases)
Each check → **PASS / WARN / FAIL + message + timestamp**. Phase 1 (pre-flight/health), Phase 2 (in-flight/behavior). Highlights and *how* each is detected:
- **Clean boot:** multiple JIYI boot messages = mid-flight reboot; watchdog resets.
- **Power stability / brownout:** sudden **unloaded** voltage drop (>0.5 V at <5 A); brownout messages.
- **Battery (12S LiPo):** min voltage thresholds — PASS >44 V, WARN >42 V, FAIL below.
- **IMU:** count + health flags (GH/AH); **consistency** (FIFO resets, primary switching); **hardware-spike detection** — single-sample glitches where AccZ jumps outside −5…−15 and snaps back (distinguishes hardware fault from a real maneuver, which is gradual).
- **Compass:** detection, **magnetic-field magnitude** (250–650 mG normal, >700 = interference), **interference** via EKF compass variance (XKF4 `SM` > 0.5 warn / >1.0 fail) and compass switching.
- **GPS:** fix type (3D/DGPS/RTK), satellite count (≥15 good, ≥6 warn, <6 fail), HDOP.
- **EKF:** readiness (FS flags before arm), **variance** per lane (`SV`/`SP`/`SH` > 0.5 warn / >1.0 fail), yaw alignment.
- **RC:** signal presence, stuck/unresponsive required channels (C1–C4), failsafe.
- **Failsafes / arming:** battery failsafe (EV Id=7), RC failsafe (EV Id=6, with "cleared" resolution logic), arming checks, **safety-bypass / forced-arm** detection.
- **Agricultural (JIYI-specific):** **spray telemetry (SPRA — area/volume/velocity)**, liquid used, flight modes incl. Spray Start/Stop, radar (ARA).

---

## 7. Output — the PDF report
ReportLab document + Matplotlib charts, Google-style color palette (green/amber/red). Includes: summary tables (color-coded per check), **flight-path map (lat/lng)**, altitude, battery voltage, vibration, attitude (roll/pitch/yaw), and spray stats. Auto-named `<logname>_report.pdf`, returned as a download; temp files cleaned via a background task.

---

## 8. Tech stack (name it precisely)
- **Backend:** Python, FastAPI, Uvicorn, `struct` (binary parsing), NumPy, Matplotlib, ReportLab, subprocess (`mono`/`xvfb-run`), asyncio.
- **Frontend:** React + **TypeScript**, Vite, Tailwind CSS.
- **Infra:** Docker + docker-compose; Mono + Xvfb for the .NET converter; CORS-scoped API.
- **Formats:** ArduPilot DataFlash `.bin`, JIYI K++ binary (plain + XOR-encrypted) and text logs.

---

## 9. Likely deep-dive questions + crisp answers
1. **"How do you detect the log format?"** → magic bytes: `0xA3 0x95` ArduPilot, `0x00 0xFF`/`0x37 0xC8` JIYI, else text via >80% printable sniff.
2. **"Walk me through the JIYI XOR decryption."** → §3.
3. **"Why Mono and Xvfb?"** → §4.
4. **"Why the asyncio lock — and how would you remove it?"** → fixed filenames serialize; fix = per-job temp dir / conversion queue.
5. **"How do you parse a self-describing binary log?"** → FMT (0x80) schema first, then `struct` decode per format char + scalars.
6. **"How do you handle corrupt or partial logs?"** → range/timestamp filters, fallbacks, median instead of last value.
7. **"How do you detect a failing motor / brownout / compass interference?"** → RCOU imbalance; sudden unloaded voltage drop; EKF `SM` variance + field magnitude.
8. **"IMU hardware fault vs a real maneuver?"** → glitch = instantaneous spike that snaps back; maneuver = gradual change (your spike detector encodes exactly this).
9. **"Biggest weaknesses / what would you improve?"** → no automated tests; synchronous parsing; the fixed-filename converter bottleneck; would add tests, unique temp dirs, a job queue, and a labeled validation set to measure check precision.
10. **"How would you extend it to PX4 ULog?"** → add a ULog parser branch (pyulog) behind the same detection + report interface.

---

## 10. Honest framing of impact (no fabricated numbers)
- Real, provable: **dual-format + XOR-decrypt**, **~30 automated checks**, **50+ message types decoded**, **~7,200 lines solo**, agricultural spray analytics.
- Not measured: no labeled ground-truth set, so it's "automates manual log review and flags probable causes," not a measured precision/recall. Say that honestly if asked.
