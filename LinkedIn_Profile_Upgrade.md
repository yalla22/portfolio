# LinkedIn Profile Upgrade — Janadri Yalla Yashwanth

Copy each block into the matching LinkedIn field. Order of impact: Headline → About → Open-to-Work → Experience → Skills → Featured → Photo/Banner/URL.

---

## 1) HEADLINE  (Profile → edit → Headline · ~220 char limit)
Keyword-rich so you surface in more recruiter searches, distinctive so you're remembered:

```
Software Engineer @ Marut Drones | Computer Vision & Geospatial AI | Python · PyTorch · FastAPI · ArduPilot | Drone detection pipelines, log analysis & autonomous flight | Open to work · Immediate joiner
```

Alternates (swap if you want to steer toward a track):
- **Backend-leaning:** `Software Engineer @ Marut Drones | Python Backend + AI | FastAPI · Celery · Docker · PostgreSQL | Production ML detection APIs | Open to work`
- **Broad IT:** `Software Engineer | Python, FastAPI, React, Docker | Full-stack, backend & AI/ML | B.Tech CSE (AI & ML) | Immediate joiner`

---

## 2) ABOUT  (the centerpiece — 2,600 char limit; recruiters read this)
```
I'm a software engineer at Marut Drones building AI systems that turn drone and aerial imagery into decisions — computer vision, autonomous flight, and the production backends that serve them.

What I've shipped:
• Production computer-vision detection pipelines (stockpile volume, tree-crown, building footprint) integrating SAM-2, DeepForest, and GroundingDINO/LangSAM behind a FastAPI backend, with Celery/Redis job orchestration and cloud-optimized rasters streamed from S3.
• A flight-log diagnostics platform that reads both ArduPilot and JIYI logs — including reverse-engineering JIYI's XOR-encrypted format — and runs ~30 automated health checks to surface probable crash causes, then generates PDF reports.
• An autonomous precision-landing system on real ArduPilot hardware (Raspberry Pi + AprilTag + MAVLink) achieving ~5–10 cm landings.
• Custom YOLO object detectors trained on self-labeled datasets (vehicle, number-plate, water, fence).

Toolbox: Python, C++, PyTorch, OpenCV, YOLO, FastAPI, Celery, Redis, PostgreSQL, Docker, GitHub Actions, rasterio/GDAL, ArduPilot/MAVLink.

I like owning problems end to end — from model training and data pipelines to Dockerized deployment and debugging in production.

B.Tech in Computer Science (AI & ML), CGPA 8.6. Open to Software Engineer / Machine Learning / Computer Vision / Backend roles — immediate joiner, open to relocating anywhere in India.

📫 yallayashwanth99@gmail.com  ·  GitHub: github.com/yalla22
```

---

## 3) OPEN TO WORK  (Profile → Open to → Finding a new job)
- **Job titles:** Software Engineer · Machine Learning Engineer · Computer Vision Engineer · Backend Developer · Python Developer
- **Locations:** Hyderabad · Bengaluru · Pune · Chennai · Remote (India) — (you'll relocate anywhere)
- **Start date:** Immediately
- **Visibility:** "All LinkedIn members" if openly searching, or "Recruiters only" if you don't want your current employer to see.

---

## 4) EXPERIENCE

### Marut Drones — Software Engineer  (set the exact title to match your offer letter)
Feb 2026 – Present · Hyderabad · (link the company page: Marut Drones)
```
Software engineer on the drone AI / automation team, building and deploying production computer-vision and geospatial systems.

• Built three production detection pipelines (stockpile volume, tree-crown, building footprint) integrating SAM-2, DeepForest, and GroundingDINO/LangSAM behind a FastAPI backend, with async Celery/Redis job APIs (live progress, cancellation, RBAC).
• Derived per-object stockpile volumes (m³) and material classification from nDSM height integration, with a 7-factor confidence rubric and cross-tile NMS deduplication.
• Streamed cloud-optimized GeoTIFFs block-by-block from S3 via GDAL /vsis3/ + rasterio (no full-raster load) and tuned S3 multipart transfers for large orthomosaics.
• Built a flight-log diagnostics platform for ArduPilot and JIYI logs — including XOR-decrypting JIYI's encrypted format — running ~30 automated health checks and generating PDF reports.
• Packaged the PyTorch/SAM-2 stack into Docker images shipped via GitHub Actions to systemd-managed GPU/CPU workers.
```

### Rooman Technologies — Machine Learning Intern
Jan 2025 – Mar 2025
```
Built ML solutions for healthcare; developed and evaluated a sleep-disorder classification model on physiological and behavioral data, reaching 98% accuracy, delivered via a simple web app for clinicians.
```

---

## 5) PROJECTS  (Profile → Add section → Projects)
- **Flight Log Analyzer — Drone Diagnostics Platform** — Full-stack (FastAPI + React/TS) tool that ingests ArduPilot & JIYI logs (with XOR decryption + Mono/Xvfb conversion) and runs a two-phase ~30-check engine to diagnose crashes; PDF reports. *Skills: Python, FastAPI, React, Docker.*
- **Marut Survey Platform — AI Detection Backend** — Three CV detection services (SAM-2, DeepForest, GroundingDINO) behind FastAPI with Celery/Redis, S3/GDAL streaming, stockpile volume estimation. *Skills: FastAPI, PyTorch, Celery, Redis, GDAL.*
- **Aerial Image Object Detection — Multi-Model Benchmark** — Benchmarked 4+ segmentation models; selected SegFormer-B5 for the cleanest detections on drone panoramas. *Skills: PyTorch, SegFormer, OpenCV.*
- **Autonomous Precision Landing** — ArduPilot + Raspberry Pi + AprilTag + MAVLink; multi-mode state machine; ~5–10 cm landings. *Skills: ArduPilot, MAVLink, OpenCV, Python.*
- **Custom YOLO Object Detection** — Trained YOLO detectors on self-labeled datasets (vehicle, number-plate, water, fence). *Skills: YOLO, PyTorch, OpenCV.*

---

## 6) SKILLS  (add these; LinkedIn ranks you in search by them — pin your top 3)
**Pin (top 3):** Computer Vision · Python · Machine Learning

Add all: Python · C++ · C · Java · SQL · Computer Vision · Machine Learning · Deep Learning · PyTorch · TensorFlow · OpenCV · YOLO · Object Detection · Image Segmentation · FastAPI · REST APIs · Celery · Redis · PostgreSQL · Docker · GitHub Actions · CI/CD · Linux · Git · Geospatial Analysis · GDAL · rasterio · ArduPilot · MAVLink · Robotics · Data Structures & Algorithms

> Tip: go to each Experience/Project and attach the relevant skills — LinkedIn shows "endorsed / used at Marut Drones," which ranks higher.

---

## 7) FEATURED  (Profile → Add section → Featured — this is prime real estate)
- **Your portfolio link** (once deployed — e.g. the Vercel URL)
- **GitHub:** github.com/yalla22 (make sure 1–2 repos are public with READMEs first)
- **A post** announcing the Flight Log Analyzer (draft below) — pin it here

---

## 8) PROFILE HYGIENE (quick wins)
- **Photo:** clean head-and-shoulders, plain background, smiling. (Profiles with photos get far more views.)
- **Banner:** a simple drone/tech or abstract banner (Canva has free ones) — beats the default blue.
- **Custom URL:** you already have one (…/janadri-yalla-yashwanth-9579b5306) — you can shorten it in Settings → Edit public profile & URL.
- **Location:** Hyderabad, India.
- **Contact info:** add email + GitHub + portfolio.
- **"Providing services":** you can toggle this to appear in more searches (e.g. Software Development, Computer Vision).

---

## 9) LAUNCH POST  (post it, then pin to Featured — drives profile views)
```
I built a flight-log diagnostics platform that reads logs from two different drone flight controllers — ArduPilot and JIYI — and automatically finds what went wrong.

The interesting part: JIYI encrypts its logs with a single-byte XOR cipher. Once I spotted that the encrypted header decrypts to the known message marker, I could decrypt the whole file, convert it, and run it through a ~30-check diagnostic engine that flags power, IMU, GPS, EKF, compass, and failsafe issues — then generates a PDF crash report.

Full-stack: FastAPI + React, ~7,200 lines, Dockerized.

Always happy to talk drones, computer vision, and backend engineering. #drones #computervision #Python #FastAPI #ArduPilot #MachineLearning
```
```
```
