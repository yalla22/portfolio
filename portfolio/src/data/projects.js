// Project records — verified accurate against build_resumes.py and the source
// write-ups (project_1, project2, project3, "project 4", project5).
// Category values drive the filter chips.

export const FILTERS = [
  "All",
  "Computer Vision",
  "Backend",
  "Robotics",
  "Full-Stack",
  "Geospatial",
];

// Public GitHub profile. TODO: point each project at its own repo URL once the
// individual repositories are published (replace this shared profile link).
const REPO = "https://github.com/yalla22";

export const projects = [
  {
    id: "flight-log-analyzer",
    title: "Flight Log Analyzer — Full-Stack Drone Diagnostics Platform",
    categories: ["Full-Stack", "Backend"],
    status: "PASS",
    summary:
      "A full-stack web app that ingests raw drone flight logs and auto-generates professional PDF health/crash reports.",
    overview:
      "A user uploads a raw flight log from the browser; the backend auto-detects the format, parses the binary/text data, runs 50+ diagnostic checks across flight phases, and returns a downloadable PDF with charts, a flight-path map, and PASS/WARN/FAIL findings — including the probable cause of a crash. Supports ArduPilot (.bin) and JIYI K++ agricultural-drone logs.",
    tech: [
      "React 19",
      "TypeScript",
      "FastAPI",
      "Python",
      "ReportLab",
      "Matplotlib",
      "Docker",
    ],
    metrics: [
      "~7,200 LOC solo",
      "50+ diagnostic checks",
      "2 log formats (ArduPilot .bin + JIYI K++)",
      "Auto PDF crash reports",
    ],
    bullets: [
      "Built a full-stack web app that ingests raw drone flight logs and auto-generates professional PDF health/crash reports, supporting both ArduPilot (.bin) and JIYI K++ formats with automatic binary-vs-text detection via magic-byte sniffing.",
      "Engineered a from-scratch binary parser for the ArduPilot/DataFlash self-describing log format using Python struct, decoding 50+ message types and reconstructing real-world IST timestamps from GPS-week data.",
      "Implemented a phased diagnostic engine running 50+ automated checks (power, IMU/vibration, GPS, EKF, compass, RC, failsafes), classifying findings as PASS/WARN/FAIL and inferring probable crash cause.",
      "Developed automated PDF reporting with ReportLab + Matplotlib (flight-path maps, sensor charts, color-coded tables); built the React 19 + Vite + Tailwind front end with file upload and download handling.",
      "Containerized the full stack with Docker / Docker Compose; integrated a .NET converter via Mono + Xvfb inside Linux (~7,200 LOC, solo-built).",
    ],
    problem:
      "Raw binary drone flight logs are unreadable to operators, and after an incident the probable crash cause is buried across thousands of sensor messages.",
    solution:
      "A full-stack web app: upload a log in the browser, auto-detect the format, parse the binary/text data, run 50+ phased diagnostic checks, and return a downloadable PDF crash/health report with charts, a flight-path map, and PASS/WARN/FAIL findings.",
    impact: [
      "~7,200 lines of code, built solo across front and back end",
      "50+ automated diagnostic checks across all flight phases",
      "Supports 2 log ecosystems — ArduPilot .bin + JIYI K++",
      "Auto-infers probable crash cause into a shareable PDF",
    ],
    architecture: [
      "React / TypeScript upload UI posts the log to FastAPI /analyze",
      "Magic-byte sniffing auto-detects binary-vs-text format",
      "From-scratch ArduPilot/DataFlash + JIYI parser (Python struct) decodes 50+ message types",
      "FlightAnalysis engine runs 50+ checks (power, IMU, GPS, EKF, compass, RC, failsafes)",
      "ReportLab + Matplotlib render the PDF (flight-path map, sensor charts, color-coded tables)",
      "Dockerized stack with a .NET converter via Mono + Xvfb on Linux",
    ],
    gallery: [
      {
        src: "/showcase/flight-log-analyzer-1.jpg",
        alt: "Generated PDF flight-health report page with PASS/WARN/FAIL findings.",
        placeholder: "flightlog",
      },
      {
        src: "/showcase/flight-log-analyzer-2.jpg",
        alt: "Reconstructed flight-path map overlaid on sensor charts.",
        placeholder: "flightlog",
      },
    ],
    repo: REPO,
    live: null,
    demo: null,
  },
  {
    id: "marut-survey-platform",
    title: "Marut Survey Platform — Backend & AI Detection Services",
    categories: ["Backend", "Computer Vision", "Geospatial"],
    status: "PASS",
    summary:
      "Three production computer-vision detection services with async APIs, streaming cloud GeoTIFFs from S3, RBAC, and CI/CD.",
    overview:
      "Production backend powering stockpile-volume, tree-crown, and building-detection services on aerial imagery. Streams cloud-optimized GeoTIFFs directly from S3, runs CRS-aware geospatial analysis with DSM/DTM elevation, and exposes asynchronous detection APIs with job queuing, progress, cancellation, and role-based access control. This is the AI/services layer of the platform — the companion case study covers the product web app and map viewer built on top of it.",
    internal: true,
    tech: [
      "FastAPI",
      "Celery",
      "Redis",
      "PostgreSQL",
      "PyTorch",
      "SAM-2",
      "DeepForest",
      "GroundingDINO",
      "S3/GDAL",
      "rasterio",
      "Docker",
      "GitHub Actions",
    ],
    metrics: [
      "3 production CV services",
      "Async Celery + Redis jobs",
      "S3 COG streaming via /vsis3",
      "RBAC + CI/CD",
    ],
    bullets: [
      "Built three production computer-vision detection services (stockpile volume, tree-crown, and building detection) on aerial imagery using SAM-2, DeepForest, and GroundingDINO, integrated into a FastAPI backend.",
      "Engineered geospatial raster processing that streams cloud-optimized GeoTIFFs directly from S3 via GDAL /vsis3/ + rasterio — CRS-aware area computation, tiled inference, and DSM/DTM elevation analysis for volume/height estimation.",
      "Designed asynchronous detection APIs with Celery + Redis — job queuing, live progress, cancellation, and role-based access control (RBAC); Pydantic v2 schemas and Alembic database migrations.",
      "Owned Dockerization, ML dependency packaging (PyTorch / SAM-2 / DeepForest / GroundingDINO), GitHub Actions CI/CD, and systemd GPU/CPU worker deployment.",
    ],
    problem:
      "Survey teams need automated, repeatable detections (stockpile volume, tree crowns, buildings) over huge cloud-hosted aerial rasters — without downloading terabytes or blocking the API on long ML jobs.",
    solution:
      "Three production computer-vision detection services behind a FastAPI backend that streams cloud-optimized GeoTIFFs straight from S3, runs CRS-aware geospatial analysis, and exposes asynchronous detection APIs with job control and role-based access.",
    impact: [
      "3 production CV services — stockpile volume, tree-crown, building detection",
      "Async Celery + Redis jobs with progress + cancellation",
      "Streams COGs from S3 via GDAL /vsis3 — no full downloads",
      "Role-based access control plus GitHub Actions CI/CD",
    ],
    architecture: [
      "POST /detect enqueues a job on Celery + Redis",
      "Worker streams a COG from S3 via GDAL /vsis3 + rasterio",
      "SAM-2 / DeepForest / LangSAM run tiled, CRS-aware inference",
      "OpenCV NMS / HSV filtering cleans detections",
      "DSM/DTM elevation derives height and stockpile volume",
      "Returns georeferenced GeoJSON; RBAC + Alembic migrations; systemd GPU/CPU workers",
    ],
    gallery: [
      {
        src: "/showcase/marut-survey-platform-1.jpg",
        alt: "Detection service results overlaid on an aerial orthomosaic.",
        placeholder: "buildings",
      },
      {
        src: "/showcase/marut-survey-platform-2.jpg",
        alt: "Async job dashboard showing queued detection jobs and progress.",
        placeholder: "ortho",
      },
    ],
    repo: null, // internal — repo may stay private
    live: null,
    demo: null,
  },
  {
    id: "marut-survey-webapp",
    title: "Marut Survey Platform — Geospatial Web App",
    categories: ["Full-Stack", "Geospatial"],
    status: "PASS",
    internal: true,
    summary:
      "Feature and fix work across the survey product's map viewer — Propeller-style Cut/Fill heat-maps, measurement labels, authenticated tile caching, and data-file management.",
    overview:
      "The product web app that sits on top of the AI detection services (see the companion Backend & AI case study): an OpenLayers map viewer where surveyors run Cut/Fill analysis, draw measurements, and manage survey media. I shipped features and fixes across both repositories — the TypeScript/React 18 frontend and the FastAPI/PostGIS backend — spanning the map viewer, Cut/Fill tools, the measurement/annotation system, and Data Files management.",
    tech: [
      "TypeScript",
      "React 18",
      "OpenLayers",
      "Zustand",
      "TailwindCSS",
      "shadcn/ui",
      "React Router v7",
      "Service Workers",
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL/PostGIS",
      "Alembic",
      "Celery",
      "rasterio/GDAL",
      "MinIO / Wasabi S3",
    ],
    metrics: [
      "Propeller-style Cut/Fill heat-map",
      "Tile-auth SW fix — no more idle 401s",
      "2 endpoints → 1 atomic bulk-move API",
      "tsc -b type-checked + lint-clean",
    ],
    bullets: [
      "Built a Propeller-style Cut/Fill heat-map rendered inline on the OpenLayers map — diverging red (cut) / blue (fill) with a transparent dead-band, an editable colour-stop + transparent-band editor, and a Smart-base default so plane elevation is optional.",
      "Fixed heat-map persistence so it saves with its measurement (reusing the compute's COG) and reappears on reopen; fixed mode-aware colours — Smart-base/Flat use the opposite diff sign from differential mode, so colours were inverted.",
      "Fixed the tile-auth Service Worker: authed tiles returned 401 after the SW dropped its in-memory token on idle restart — the SW now fetches the current token before its first request and the main thread hands back the live token.",
      "Rebuilt measurement/annotation labels: the value badge anchors snugly above the polygon via a ray-cast north-edge anchor (was floating at the bounding-box corner), with per-side length labels at edge midpoints (rectangle → length + breadth, square → one side).",
      "Merged 'Change category' into the Data Files Move flow — drills Org → Project → Order → Folder and on confirm moves + re-tags the media category atomically; consolidated the backend into a single POST /assets/bulk-move with optional asset_type, replacing a separate reclassify endpoint.",
      "Code quality: reused the canonical assetTypeConstraints label source, made the selection toolbar icon-only with tooltips across all 8 media tabs, reordered the map rail, and switched project fetching to server-scoped getProjectsByOrg — fixing a latent 100-item pagination gap.",
    ],
    problem:
      "Surveyors needed the analysis UX to match the platform's AI backend: Cut/Fill results readable directly on the map, measurement labels that sit where a surveyor expects, authenticated map tiles that don't 401 after the app sits idle, and one coherent flow for moving and re-categorising survey media.",
    solution:
      "Feature and fix work across the platform's two repositories — the OpenLayers/React/Zustand map viewer and its FastAPI/PostGIS backend. Shipped an inline diverging Cut/Fill heat-map with editable colour stops and verified save→reopen persistence, repaired the token-handling Service Worker behind authenticated tile caching, re-anchored measurement labels with a ray-cast north-edge algorithm, and consolidated media move + reclassify into one atomic bulk-move API.",
    impact: [
      "Cut/Fill heat-map ships inline on the map — cut=red, fill=blue, transparent dead-band, editable colour stops",
      "Save→reopen chain verified end-to-end against the local backend; mode-inverted colours fixed",
      "Killed intermittent tile 401s — SW fetches a live auth token before its first request",
      "Move + re-categorise now one atomic POST /assets/bulk-move (replaced 2 endpoints)",
      "Fixed a latent 100-item pagination gap via server-scoped getProjectsByOrg",
    ],
    architecture: [
      "React 18 + TypeScript (Vite) UI; Zustand stores drive an OpenLayers map — tile/vector layers, overlays, XYZ sources; React Router v7 screens",
      "tile-cache-sw.js Service Worker caches authenticated XYZ tiles; fetches the current token before its first request after any restart",
      "Cut/Fill panel renders a diverging red/blue heat-map inline from the compute's COG, with a colour-stop + transparent-band editor and Smart-base default",
      "Heat-map persists with its measurement and re-renders on reopen; colouring is mode-aware (Smart-base / Flat vs differential diff sign)",
      "Measurement labels: ray-cast north-edge anchor places the value badge above the polygon; per-side lengths render at edge midpoints",
      "FastAPI + SQLAlchemy on PostgreSQL/PostGIS with Alembic migrations; Celery + rasterio/GDAL for raster/COG work; MinIO (local) / Wasabi S3 (dev/prod); POST /assets/bulk-move moves + re-tags media atomically",
    ],
    gallery: [
      {
        src: "/showcase/cutfill-heatmap.svg",
        alt: "Diverging red/blue Cut/Fill heat-map rendered inline on the map with the colour-stop editor open.",
        placeholder: "cutfill",
      },
      {
        src: "/showcase/marut-survey-webapp-2.jpg",
        alt: "Measurement polygon with the value badge anchored above it and per-side length labels at edge midpoints.",
        placeholder: "ortho",
      },
    ],
    repo: null, // internal — product repositories are private
    live: null,
    demo: null,
  },
  {
    id: "aerial-object-detection",
    title: "Aerial Image Object Detection — Multi-Model Benchmark",
    categories: ["Computer Vision"],
    status: "PASS",
    summary:
      "A CV pipeline detecting buildings, vehicles, and trees from high-resolution drone panoramas, with a head-to-head model benchmark.",
    overview:
      "Detects buildings, vehicles, and trees from stitched drone panoramas up to 14,400 × 7,200 px. SegFormer-B5 (ADE20K, 150 classes) was selected after benchmarking 4+ segmentation models head-to-head, cutting false positives ~3× versus over-segmenting alternatives. Runs on GPU/CUDA with a full OpenCV/NumPy inference pipeline and drone-video support.",
    tech: [
      "PyTorch",
      "Hugging Face Transformers",
      "SegFormer-B5/ADE20K",
      "SAM",
      "CLIP",
      "OpenCV",
    ],
    metrics: [
      "Panoramas up to 14,400×7,200 px",
      "4+ models benchmarked",
      "~3× fewer false positives",
      "~7–11 s / image",
    ],
    bullets: [
      "Developed a computer-vision pipeline detecting buildings, vehicles, and trees from high-resolution drone imagery (stitched panoramas up to 14,400 × 7,200 px) using SegFormer-B5 (ADE20K, 150 classes) with PyTorch and Hugging Face Transformers.",
      "Benchmarked 4+ segmentation models (SegFormer-B5/B2, Aerial-Drone SegFormer, SAM + CLIP) head-to-head and selected ADE20K for best precision, cutting false positives ~3× versus over-segmenting alternatives.",
      "Engineered the full inference pipeline in OpenCV/NumPy: sliding-window tiling, HSV sky-skipping, semantic-mask-to-instance contour extraction, geometric shape filtering, and per-class Non-Max Suppression.",
      "Delivered annotated outputs (per-class count overlays + JSON), batch-folder processing, and drone-video support (frame-skip → annotated MP4), running on GPU/CUDA at ~7–11 s per image.",
    ],
    problem:
      "Off-the-shelf detectors over-segment giant stitched drone panoramas, flooding results with false positives and choking on images far larger than any model's input size.",
    solution:
      "A multi-model segmentation benchmark plus a tuned OpenCV inference pipeline: SegFormer-B5 (ADE20K) was selected head-to-head, with sliding-window tiling and geometric filtering to detect buildings, vehicles, and trees cleanly.",
    impact: [
      "Handles stitched panoramas up to 14,400 × 7,200 px",
      "4+ segmentation models benchmarked head-to-head",
      "~3× fewer false positives versus over-segmenting alternatives",
      "~7–11 s per image on GPU/CUDA",
    ],
    architecture: [
      "Split the panorama into 1024 px sliding-window tiles (200 px overlap)",
      "HSV sky-skipping drops empty sky tiles before inference",
      "SegFormer-B5 (ADE20K, 150 classes) runs semantic segmentation",
      "Mask → instance contour extraction turns segments into objects",
      "Geometric shape filtering + per-class Non-Max Suppression remove noise",
      "Emits annotated JPG overlays + comparison.json model report",
    ],
    gallery: [
      {
        src: "/showcase/aerial-object-detection-1.jpg",
        alt: "Annotated drone panorama with per-class building and vehicle detections.",
        placeholder: "drone",
      },
      {
        src: "/showcase/aerial-object-detection-2.jpg",
        alt: "Side-by-side benchmark comparison of segmentation models.",
        placeholder: "ortho",
      },
    ],
    repo: REPO,
    live: null,
    demo: null,
  },
  {
    id: "geoai-detection",
    title: "GeoAI Detection — Buildings & Trees from Orthomosaics",
    categories: ["Computer Vision", "Geospatial"],
    status: "PASS",
    summary:
      "Zero-shot building & tree-crown detection on drone orthomosaics, made 3D-aware with DSM/DTM elevation filtering.",
    overview:
      "A geospatial pipeline that finds building footprints and individual tree crowns from drone RGB orthomosaics, then uses elevation data to remove false positives that RGB alone cannot reject. Zero-shot LangSAM rooftops are validated against the DSM (nDSM = roof − ground); DeepForest crowns are separated from grass using a Canopy Height Model (CHM = DSM − DTM, keep ≥1.5 m). Outputs georeferenced GeoJSON.",
    tech: [
      "Python",
      "PyTorch",
      "LangSAM (SAM + GroundingDINO)",
      "DeepForest",
      "rasterio",
      "OpenCV",
      "GeoJSON",
    ],
    metrics: [
      'Zero-shot "building roof" prompt',
      "nDSM drops flat false positives",
      "CHM = DSM − DTM height filter",
      "Georeferenced GeoJSON out",
    ],
    bullets: [
      'Built a geospatial building-detection pipeline on drone orthomosaics using zero-shot LangSAM (SAM + GroundingDINO) with a "building roof" text prompt, processing large GeoTIFFs block-wise via rasterio (no training data required).',
      "Eliminated flat false positives (roads, bare fields) by filtering every detection against the DSM — computing height = roof − ground (nDSM) and dropping objects without real vertical structure; exported georeferenced GeoJSON with area and height.",
      "Built individual-tree-crown detection with DeepForest (RetinaNet, NEON-pretrained), GSD-aware resampling tuned for dense tropical canopies, HSV green-filtering, crown merging, and NMS.",
      "Separated real trees from grass using a Canopy Height Model (CHM = DSM − DTM), keeping only crowns ≥ 1.5 m tall — removing flat green vegetation that color filters alone cannot reject.",
    ],
    problem:
      "RGB imagery alone can't tell a flat rooftop-colored road from a real building, or tall grass from a tree crown — so pure-vision detectors produce false positives a survey can't trust.",
    solution:
      "Elevation-aware detection: zero-shot LangSAM finds rooftops and DeepForest finds tree crowns, then DSM/DTM elevation models validate each detection in 3D before exporting georeferenced GeoJSON.",
    impact: [
      "Zero-shot — no training data, just a “building roof” prompt",
      "nDSM (roof − ground) drops flat false positives",
      "CHM (DSM − DTM ≥ 1.5 m) separates trees from grass",
      "Outputs georeferenced GeoJSON with area + height",
    ],
    architecture: [
      "Buildings: block-tile the ortho → LangSAM “building roof” prompt",
      "Filter rooftops by green/shape/area, then nDSM (roof − ground ≥ 5 m)",
      "Trees: resample to 15 cm GSD → DeepForest predict_tile",
      "HSV green filter + crown merging + NMS clean the crowns",
      "CHM (DSM − DTM ≥ 1.5 m) removes flat vegetation",
      "Export georeferenced GeoJSON for both layers",
    ],
    gallery: [
      {
        src: "/showcase/geoai-detection-1.jpg",
        alt: "Building rooftops detected on an orthomosaic with nDSM height tags.",
        placeholder: "buildings",
      },
      {
        src: "/showcase/geoai-detection-2.jpg",
        alt: "Tree crowns detected with CHM height bars separating trees from grass.",
        placeholder: "trees",
      },
    ],
    repo: REPO,
    live: null,
    demo: null,
  },
  {
    id: "precision-landing",
    title: "Autonomous Precision Landing on Moving Platform",
    categories: ["Robotics"],
    status: "PASS",
    summary:
      "An autonomous drone that lands on an AprilTag target — on stationary and moving (ground-rover) platforms — at ~5–10 cm accuracy.",
    overview:
      "A Raspberry Pi 5 companion computer (pupil-apriltags + picamera2 + OpenCV) streams LANDING_TARGET and velocity setpoints to a CubeOrange (ArduCopter) over MAVLink at 20 Hz. A three-mode state machine handles visual P-control with rover-velocity feed-forward, GPS-haversine approach, and a hover fallback — with pilot RC override, velocity caps, and touchdown auto-disarm. Flew proven autonomous stationary-tag landings (design target ~5–10 cm).",
    tech: [
      "ArduPilot/ArduCopter",
      "MAVLink/pymavlink",
      "Raspberry Pi 5",
      "CubeOrange",
      "AprilTag",
      "OpenCV",
      "Python",
      "systemd",
    ],
    metrics: [
      "~5–10 cm stationary-tag landing",
      "3-mode state machine",
      "20 Hz control",
      "Touchdown auto-disarm",
    ],
    bullets: [
      "Built an autonomous drone precision-landing system that lands on an AprilTag target on stationary and moving (ground-rover) platforms; flew proven autonomous stationary-tag landings (design target ~5–10 cm).",
      "Wrote the Raspberry Pi 5 companion-computer controller (pupil-apriltags + picamera2 + OpenCV) streaming LANDING_TARGET and velocity setpoints to a CubeOrange (ArduCopter) over MAVLink (pymavlink) at 20 Hz.",
      "Designed a three-mode state machine — visual P-control with rover-velocity feed-forward, GPS-NAV haversine approach, and hover fallback — with pilot RC override, velocity caps, and touchdown auto-disarm.",
      "Implemented multi-vehicle MAVLink (drone + rover SYSIDs), camera calibration, systemd auto-start, and a BENCH safety mode for props-off bench testing.",
    ],
    problem:
      "GPS-only landing isn't precise enough for recovery pads or moving platforms — the drone can miss the target by meters, where centimeters matter.",
    solution:
      "A vision-guided autonomous precision-landing system: a Raspberry Pi 5 companion computer tracks an AprilTag and streams landing/velocity setpoints to ArduCopter over MAVLink, with a multi-mode state machine and safety overrides.",
    impact: [
      "Proven autonomous stationary-tag landings (design target ~5–10 cm)",
      "3-mode state machine (visual / GPS / hover fallback)",
      "20 Hz closed-loop control over MAVLink",
      "Pilot RC override + touchdown auto-disarm",
    ],
    architecture: [
      "Pi 5 runs picamera2 + pupil-apriltags + OpenCV to detect the tag",
      "Streams LANDING_TARGET + SET_POSITION_TARGET_LOCAL_NED at 20 Hz",
      "MAVLink (pymavlink) drives a CubeOrange / ArduCopter",
      "3-mode FSM: visual P-control + rover-velocity feed-forward / GPS-haversine / hover",
      "Pilot RC override and velocity caps for safety",
      "Touchdown auto-disarm; systemd auto-start; BENCH props-off test mode",
    ],
    gallery: [
      {
        src: "/showcase/precision-landing-1.jpg",
        alt: "Drone descending onto an AprilTag landing target with crosshair overlay.",
        placeholder: "precland",
      },
      {
        src: "/showcase/precision-landing-2.jpg",
        alt: "Companion-computer telemetry showing the 3-mode landing state machine.",
        placeholder: "precland",
      },
    ],
    repo: REPO,
    live: null,
    demo: null,
  },
];
