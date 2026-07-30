# -*- coding: utf-8 -*-
"""Canonical candidate profile for the Job Copilot.

The rich text corpus (skills + project bullets) is pulled from the existing
``build_resumes.py`` so there is a single source of truth for your resume content.
The structured fields below (target titles, locations, experience, hard rules)
are what the matcher and eligibility checker actually reason over.
"""
from __future__ import annotations
import os
import sys

# --- pull the resume content from build_resumes.py (one folder up) ----------
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

try:
    import build_resumes as _br  # noqa: E402
    _HAVE_BR = True
except Exception:  # python-docx missing, etc. -> fall back to inline corpus
    _br = None
    _HAVE_BR = False


# Map a detected job "track" to the resume file already in the folder.
RESUME_FOR_TRACK = {
    "drone":     "Resume_Janadri_Yalla_Yashwanth_Drone_Robotics_Software_Engineer",
    "cv_ml":     "Resume_Janadri_Yalla_Yashwanth_ML_CV_Engineer",
    "backend":   "Resume_Janadri_Yalla_Yashwanth_Backend_Python_Engineer",
    "fullstack": "Resume_Janadri_Yalla_Yashwanth_Full_Stack_Engineer",
    "devops":    "Resume_Janadri_Yalla_Yashwanth_Cloud_DevOps_Systems_Engineer",
    "swe":       "Resume_Janadri_Yalla_Yashwanth_Software_Engineer_Python",
}

# Canonical skill set (flat, lowercase) used for overlap scoring + gap detection.
SKILLS = sorted({
    # languages
    "python", "c", "sql", "typescript", "javascript", "java", "bash",
    # ml / dl / cv
    "pytorch", "tensorflow", "scikit-learn", "hugging face", "transformers",
    "cuda", "gpu", "opencv", "numpy", "segformer", "sam", "sam-2", "deepforest",
    "groundingdino", "langsam", "clip", "computer vision", "deep learning",
    "machine learning", "semantic segmentation", "object detection",
    "image processing", "model benchmarking",
    # geospatial
    "rasterio", "gdal", "geotiff", "cog", "dsm", "dtm", "chm", "geojson",
    "geospatial", "gis", "qgis", "remote sensing", "crs", "projections",
    # backend / mlops
    "fastapi", "uvicorn", "asgi", "celery", "redis", "postgresql", "postgis",
    "sqlalchemy", "pydantic", "alembic", "rest api", "async", "microservices",
    "s3", "minio", "boto3", "jwt", "rbac", "cors",
    # devops
    "docker", "docker compose", "github actions", "ci/cd", "systemd", "linux",
    "aws", "git",
    # robotics / drone
    "ardupilot", "arducopter", "mavlink", "pymavlink", "mission planner",
    "raspberry pi", "apriltag", "picamera2", "px4", "ros", "slam",
    "state machine", "camera calibration", "telemetry", "perception",
    # frontend
    "react", "vite", "tailwind", "html", "css",
})

# Skills that, if a job clearly centers on them, are an instant strong signal.
CORE_STRENGTHS = [
    "computer vision", "machine learning", "pytorch", "fastapi", "python",
    "geospatial", "drone", "deep learning", "opencv", "celery",
]

PROFILE = {
    "name": "Janadri Yalla Yashwanth",
    "email": "yallayashwanth99@gmail.com",
    "phone": "+91 8790819924",
    "home_city": "hyderabad",
    # Marut (Feb 2026-present ≈ 6 months) + Rooman 3-mo intern: fresher / early-career.
    "experience_years": 0.5,
    # Keep only roles whose MINIMUM experience is 0 or 1 year — i.e. ranges like
    # 0-3, 0-2, 0-1, 1-2, "1+". Anything starting at 2+ or 3+ is marked not-eligible.
    # (matcher.required_years returns the lower bound of the range.)
    "max_required_years": 1,
    "remote_ok": True,
    "open_to_international": True,
    "locations_ok": [
        "hyderabad", "telangana", "bengaluru", "bangalore", "karnataka",
        "pune", "chennai", "noida", "delhi", "gurgaon", "gurugram", "mumbai",
        "india", "remote", "anywhere",
    ],
    # Any one of these phrases in the title/body marks an on-target role.
    "target_titles": [
        "computer vision", "machine learning", "ml engineer", "ml ", "cv ",
        "deep learning", "perception", "ai engineer", "applied scientist",
        "backend", "python", "fastapi", "api", "software engineer", "sde",
        "drone", "uav", "robotics", "autonomy", "flight software",
        "geospatial", "remote sensing", "gis", "full stack", "fullstack",
        "platform engineer",
    ],
    # Titles a ~1-yr engineer should not burn applications on (hard skip).
    "seniority_block": [
        "staff", "principal", "director", "head of", "vp ", "vice president",
        "distinguished", "architect", "manager,", " manager", "lead ",
        "engineering manager", "fellow",
    ],
    # 'senior' is a soft penalty, not a hard block (some are 3 yr roles).
    "seniority_soft": ["senior", "sr.", "sr "],
}


def _corpus_from_build_resumes() -> str:
    """Concatenate every summary, skill line and project bullet into one blob."""
    parts: list[str] = []
    if _HAVE_BR:
        for cfg in _br.ROLES.values():
            parts.append(cfg.get("summary", ""))
            for _label, val in cfg.get("skills", []):
                parts.append(val)
            parts.append(cfg.get("tools", ""))
            for proj in (cfg.get("custom_projects") or []):
                parts.append(proj.get("title", "") + " " + proj.get("tech", ""))
                parts.extend(proj.get("bullets", []))
            for b in cfg.get("marut_bullets", []) or []:
                parts.append(b)
        for proj in _br.P.values():
            parts.append(proj.get("title", "") + " " + proj.get("tech", ""))
            parts.extend(proj.get("bullets", []))
    # Always fold in the flat skill list so the corpus is never empty.
    parts.append(" ".join(SKILLS))
    parts.append(" ".join(CORE_STRENGTHS))
    return "\n".join(p for p in parts if p)


# The text representation of the candidate, used by the TF-IDF / embedding matcher.
RESUME_CORPUS = _corpus_from_build_resumes()


def _profile_facets() -> list[str]:
    """Distinct 'strength' texts for neural matching — a job is scored by its
    MAX similarity to any facet, so matching ONE of your tracks scores high
    (a pure backend role shouldn't be diluted by your CV/drone experience)."""
    facets: list[str] = []
    if _HAVE_BR:
        for cfg in _br.ROLES.values():
            facets.append(" ".join([
                cfg.get("headline", ""), cfg.get("summary", ""),
                " ".join(v for _l, v in cfg.get("skills", [])),
                cfg.get("tools", ""),
            ]).strip())
        for proj in _br.P.values():
            facets.append((proj.get("title", "") + " " + proj.get("tech", "")
                           + " " + " ".join(proj.get("bullets", []))).strip())
    facets = [f for f in facets if f]
    return facets or [RESUME_CORPUS]


# Each facet = one of your strengths (8 role summaries + 5 projects).
PROFILE_FACETS = _profile_facets()
