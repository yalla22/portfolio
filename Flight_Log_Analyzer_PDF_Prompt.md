# Prompt to generate the Flight Log Analyzer project documentation

## Note on "animated images"
A **PDF can't contain animation**. Two options:
- **PDF** → ask for a diagram-rich static document (architecture, flow, XOR illustration as clean vector diagrams). Use the prompt below as-is.
- **Animated version** → ask for an **HTML one-pager or slide deck (Reveal.js / Gamma / v0)**; then diagrams can animate (scroll-reveal, flowing pipeline arrows, Mermaid, Lottie/CSS). Change the first line of the prompt to *"Build an animated HTML slide deck…"* instead of *"Create a PDF…"*.

---

## COPY–PASTE PROMPT ↓↓↓

Create a polished, recruiter-ready **project documentation PDF** (clean, modern, technical case-study style — think Stripe/Linear docs) for the following software project. Use a professional layout: cover page, section headers, callout boxes, code snippets in monospace, and **generate clear diagrams** (system architecture, data-flow pipeline, a format-detection decision tree, an illustration of the XOR decryption, and the diagnostic-engine flow). If the output format supports motion (HTML/slides), animate the pipeline arrows and use scroll-reveal; for PDF, render the diagrams as crisp static vector graphics. Keep it truthful to the details below — do not invent metrics.

**Project:** Flight Log Analyzer — a full-stack web tool that ingests raw drone flight logs from two different flight-controller ecosystems (Pixhawk/ArduPilot and JIYI K++ agricultural drones), auto-detects the format, and generates a professional PDF diagnostics report via a two-phase, ~30-check engine that classifies findings PASS/WARN/FAIL and surfaces probable failure causes. Solo-built, ~7,200 lines.

**Author:** Janadri Yalla Yashwanth — Software Engineer, Marut Drones.

**Problem:** Drone crash/health investigation means manually reading huge binary flight logs. Different flight controllers use different, sometimes **encrypted**, log formats. Analysts need a fast, consistent, automated diagnosis instead of hours of manual plotting.

**Solution / architecture (make a diagram):**
- Frontend: React + TypeScript + Vite + Tailwind — upload a log, get a downloadable PDF.
- Backend: FastAPI (Python) — `POST /analyze`, extension allow-list + 500 MB cap.
- **Format detection by magic bytes:** ArduPilot `0xA3 0x95`; JIYI binary `0x00 0xFF` (plain) or `0x37 0xC8` (encrypted); text logs detected by >80% printable bytes.
- Routing: ArduPilot .bin → parsed directly in Python; JIYI text → parsed directly; JIYI binary → decrypt (if needed) → convert → parse.
- Output: ReportLab + Matplotlib PDF (color-coded tables, flight-path map, altitude/voltage/vibration/attitude charts, spray stats). Dockerized (docker-compose).

**JIYI XOR decryption (make this a highlighted illustrated section):**
- JIYI obfuscates SD-card `.bin` logs with a **single-byte XOR cipher, key `0x37`**.
- Encrypted header `0x37 0xC8` XORed with `0x37` yields `0x00 0xFF` — the known plaintext JIYI message marker (`0x37^0x37=0x00`, `0xC8^0x37=0xFF`) — which is how the cipher was identified.
- Pipeline: detect `0x37` signature → `XOR every byte with 0x37` → feed decrypted binary to the converter.

**Binary-to-text conversion (explain as a challenge/solution):**
- `binToLog.exe` is a Windows .NET converter run on Linux via **`mono`**, inside a virtual display via **`xvfb-run`** (headless).
- Concurrency: converter uses fixed filenames, so an **asyncio lock serializes** conversions (note as a known bottleneck + future fix: per-job temp dirs / queue).

**Self-describing parser (diagram the schema-then-data idea):**
- Both binary formats start messages with **FMT records (type `0x80`)** that declare each message's name, format string, and columns; the parser reads the schema first, then `struct`-decodes each record, applying unit scalars (e.g. lat/lng ×1e-7). Robustness: timestamp caps, range filters for corrupt values, median-not-last-value.

**Diagnostic engine (~30 checks, 2 phases — render as a categorized table/flow):**
Clean boot; power stability/brownout (sudden unloaded voltage drop); 12S battery voltage thresholds; IMU detection/health/consistency + hardware-spike detection (instant glitch vs gradual maneuver); compass detection/field-magnitude/interference (EKF variance); GPS fix type + satellite count + HDOP; EKF readiness/variance (SV/SP/SH)/yaw alignment; RC signal + stuck channels; battery & RC failsafes; arming checks + safety-bypass detection; agricultural spray telemetry (area/volume/velocity), liquid, radar. Each check → PASS/WARN/FAIL + message + timestamp.

**Tech stack:** Python, FastAPI, Uvicorn, struct, NumPy, Matplotlib, ReportLab, asyncio, subprocess; React, TypeScript, Vite, Tailwind; Docker, docker-compose, Mono, Xvfb.

**Sections to include:** Cover (title + author + one-line pitch) · Overview · Problem · Solution & Architecture (diagram) · Data-Flow Pipeline (diagram) · Format Detection (decision-tree diagram) · JIYI XOR Decryption (illustrated) · Self-Describing Binary Parser · Diagnostic Engine (table) · Sample Report visuals · Challenges & Solutions (XOR, Mono/Xvfb, concurrency, corrupt data) · Tech Stack · Results (dual-format, ~30 checks, 50+ message types, ~7,200 lines — no invented numbers) · Future Work (tests, PX4 ULog, parallel conversion, labeled validation).

Make it visually clean, well-spaced, and technical-but-readable. Prefer diagrams over walls of text.

## ↑↑↑ END PROMPT
