# -*- coding: utf-8 -*-
"""JD-driven resume tailoring.

Given a job's requirements/responsibilities, build a resume tuned for it:
  * pick the best base resume (your existing role-tailored set in build_resumes.py)
  * set the headline to the role you're applying for
  * surface the skills the JD asks for that you ALREADY have (no invented skills)
  * reorder/prioritise skill categories and projects by relevance to the JD
  * flag JD keywords you DON'T have as "gaps" (shown to you, never added to the resume)
  * render a .docx using your existing resume styling

Nothing is fabricated — only your real content is reordered and emphasised.
"""
from __future__ import annotations
import copy
import os
import re
import sys

from .profile import SKILLS, PROFILE, _ROOT
from . import matcher
from . import embedding

if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
import build_resumes as br  # noqa: E402  (your existing resume generator = single source of truth)

TRACK_TO_ROLE = {
    "cv_ml":     "ML_CV_Engineer",
    "backend":   "Backend_Python_Engineer",
    "drone":     "Drone_Robotics_Software_Engineer",
    "fullstack": "Full_Stack_Engineer",
    "devops":    "Cloud_DevOps_Engineer",
    "swe":       "Software_Engineer_Python",
}
ROLE_LABELS = {
    "ML_CV_Engineer": "ML / CV Engineer",
    "Backend_Python_Engineer": "Backend / Python Engineer",
    "Drone_Robotics_Software_Engineer": "Drone / Robotics Engineer",
    "Full_Stack_Engineer": "Full-Stack Engineer",
    "Cloud_DevOps_Engineer": "Cloud / DevOps Engineer",
    "Software_Engineer_Python": "Software Engineer (Python)",
    "EdgeVerve_Systems_Engineer": "Systems Engineer",
    "Backend_Developer": "Backend Developer",
}

TAILORED_DIR = os.path.join(br.OUT_DIR, "tailored")

# Common tech keywords used to flag JD requirements (incl. ones you may lack).
_EXTRA_KEYWORDS = {
    # infra / cloud / data
    "kubernetes", "k8s", "kafka", "spark", "hadoop", "airflow", "terraform",
    "ansible", "jenkins", "graphql", "node.js", "nodejs", "express", "django",
    "flask", "go", "golang", "rust", "java", "spring", "spring boot", "scala",
    "kotlin", "swift", "c++", "c#", ".net", "ruby", "rails", "php", "laravel",
    "tensorflow", "keras", "jax", "mlflow", "kubeflow", "onnx", "tensorrt",
    "snowflake", "databricks", "tableau", "power bi", "looker", "dbt",
    "nlp", "llm", "rag", "langchain", "bert", "gpt", "diffusion", "gan",
    "ros", "ros2", "gazebo", "slam", "lidar", "pcl", "embedded", "rtos",
    "verilog", "vhdl", "fpga", "elasticsearch", "mongodb", "cassandra",
    "kinesis", "rabbitmq", "grpc", "microservices", "helm", "gcp", "azure",
    "lambda", "dynamodb", "redshift", "bigquery", "nosql",
    # QA / test automation (so SDET-style JDs flag real gaps)
    "selenium", "cypress", "playwright", "testng", "junit", "pytest",
    "restassured", "rest assured", "postman", "jmeter", "gatling", "locust",
    "cucumber", "specflow", "bdd", "tdd", "appium", "katalon", "robot framework",
    "test automation", "automation testing", "sdet", "load testing",
    "performance testing", "api testing", "azure devops", "gitlab ci",
    "selenium webdriver", "qa", "quality engineering",
}
JD_KEYWORDS = sorted(set(SKILLS) | _EXTRA_KEYWORDS)

# Pretty display names so the tailored "Most relevant" line reads professionally
# instead of raw lowercase tokens (aws -> AWS, ci/cd -> CI/CD, fastapi -> FastAPI).
_SKILL_DISPLAY = {
    "aws": "AWS", "gcp": "GCP", "ci/cd": "CI/CD", "ci": "CI", "cd": "CD",
    "sql": "SQL", "nosql": "NoSQL", "rest api": "REST API", "api": "API",
    "gis": "GIS", "cv": "CV", "ml": "ML", "nlp": "NLP", "llm": "LLM", "rag": "RAG",
    "cuda": "CUDA", "gpu": "GPU", "tensorrt": "TensorRT", "onnx": "ONNX",
    "jwt": "JWT", "rbac": "RBAC", "cors": "CORS", "s3": "S3", "minio": "MinIO",
    "ros": "ROS", "ros2": "ROS2", "fastapi": "FastAPI", "uvicorn": "Uvicorn",
    "asgi": "ASGI", "pytorch": "PyTorch", "tensorflow": "TensorFlow",
    "opencv": "OpenCV", "numpy": "NumPy", "github actions": "GitHub Actions",
    "postgresql": "PostgreSQL", "postgis": "PostGIS", "sqlalchemy": "SQLAlchemy",
    "pydantic": "Pydantic", "alembic": "Alembic", "javascript": "JavaScript",
    "typescript": "TypeScript", "mongodb": "MongoDB", "graphql": "GraphQL",
    "node.js": "Node.js", "nodejs": "Node.js", ".net": ".NET", "c#": "C#",
    "c++": "C++", "html": "HTML", "css": "CSS", "jax": "JAX", "mlflow": "MLflow",
    "kubeflow": "Kubeflow", "k8s": "Kubernetes", "kubernetes": "Kubernetes",
    "grpc": "gRPC", "sam": "SAM", "sam-2": "SAM-2", "clip": "CLIP",
    "deepforest": "DeepForest", "groundingdino": "GroundingDINO", "langsam": "LangSAM",
    "segformer": "SegFormer", "apriltag": "AprilTag", "mavlink": "MAVLink",
    "pymavlink": "pymavlink", "ardupilot": "ArduPilot", "arducopter": "ArduCopter",
    "px4": "PX4", "slam": "SLAM", "dsm": "DSM", "dtm": "DTM", "chm": "CHM",
    "cog": "COG", "geotiff": "GeoTIFF", "geojson": "GeoJSON", "crs": "CRS",
    "qgis": "QGIS", "gdal": "GDAL", "testng": "TestNG", "junit": "JUnit",
    "jmeter": "JMeter", "restassured": "RestAssured", "rest assured": "RestAssured",
    "azure": "Azure", "azure devops": "Azure DevOps", "gitlab ci": "GitLab CI",
    "redis": "Redis", "celery": "Celery", "docker": "Docker", "linux": "Linux",
    "git": "Git", "java": "Java", "python": "Python", "scala": "Scala",
    "kotlin": "Kotlin", "go": "Go", "golang": "Go", "rust": "Rust", "ruby": "Ruby",
    "php": "PHP", "swift": "Swift", "bash": "Bash", "c": "C", "kafka": "Kafka",
    "spark": "Spark", "hadoop": "Hadoop", "airflow": "Airflow", "terraform": "Terraform",
    "jenkins": "Jenkins", "ansible": "Ansible", "selenium": "Selenium",
    "cypress": "Cypress", "playwright": "Playwright", "postman": "Postman",
    "cucumber": "Cucumber", "pytest": "pytest", "appium": "Appium",
    "microservices": "Microservices", "react": "React", "vite": "Vite",
    "tailwind": "Tailwind", "boto3": "boto3", "sdet": "SDET", "qa": "QA",
    "bdd": "BDD", "tdd": "TDD", "gatling": "Gatling", "locust": "Locust",
    "specflow": "SpecFlow", "api testing": "API Testing",
    "test automation": "Test Automation", "automation testing": "Automation Testing",
    "load testing": "Load Testing", "performance testing": "Performance Testing",
    "robot framework": "Robot Framework", "quality engineering": "Quality Engineering",
    "selenium webdriver": "Selenium WebDriver", "katalon": "Katalon",
}


def display_skill(s: str) -> str:
    return _SKILL_DISPLAY.get(s, s.title())


def _kw_in(text: str, kw: str) -> bool:
    return re.search(r"(?<![a-z0-9.+#])" + re.escape(kw) + r"(?![a-z0-9.+#])", text) is not None


def analyze_jd(jd_text: str) -> tuple[list[str], list[str]]:
    """Return (skills you have that the JD wants, JD keywords you don't have)."""
    t = jd_text.lower()
    matched = [s for s in SKILLS if _kw_in(t, s)]
    gaps = [k for k in JD_KEYWORDS if k not in set(SKILLS) and _kw_in(t, k)]
    return matched, gaps


def pick_role(jd_text: str) -> tuple[str, str]:
    track = matcher.detect_track(jd_text.lower())
    return TRACK_TO_ROLE.get(track, "Software_Engineer_Python"), track


def to_pdf(docx_path: str) -> str | None:
    """Convert a .docx to .pdf using MS Word (docx2pdf). Returns path or None.

    Word COM is single-threaded and needs CoInitialize in the calling thread
    (FastAPI runs sync endpoints in a worker thread), so we init it here.
    """
    pdf_path = os.path.splitext(docx_path)[0] + ".pdf"
    try:
        import pythoncom  # noqa
        pythoncom.CoInitialize()
    except Exception:
        pass
    try:
        from docx2pdf import convert
        convert(docx_path, pdf_path)
        return pdf_path if os.path.isfile(pdf_path) else None
    except Exception:
        return None
    finally:
        try:
            import pythoncom  # noqa
            pythoncom.CoUninitialize()
        except Exception:
            pass


_LEVEL_RE = re.compile(r"[\s,\-–—]*\b(?:i{1,3}|iv|v|[1-9])\b\s*$", re.IGNORECASE)
_SENIORITY_RE = re.compile(
    r"\b(senior|sr\.?|staff|principal|lead|distinguished|junior|jr\.?)\b", re.IGNORECASE)
_ROLE_WORDS = ("engineer", "developer", "scientist", "analyst", "architect",
               "designer", "specialist", "sde", "sdet", "programmer",
               "administrator", "consultant", "intern", "manager")


def clean_headline(role_title: str, fallback: str) -> str:
    """Turn a raw job title into a sane resume headline.

    Strips seniority/level markers so a fresher never claims "Senior" or "III",
    and falls back to the base resume's headline if the title isn't role-like
    (e.g. an internal req code). You can always type an exact headline yourself.
    """
    t = (role_title or "").strip()
    if not t:
        return fallback
    t = _LEVEL_RE.sub("", t)            # drop trailing "III", "II", "2", ...
    t = _SENIORITY_RE.sub("", t)        # drop Senior/Staff/Principal/Lead/...
    t = re.sub(r"\s{2,}", " ", t).strip(" -–—,")
    low = t.lower()
    if not t or not any(re.search(r"\b" + w + r"\b", low) for w in _ROLE_WORDS):
        return fallback                 # not a usable role string -> base headline
    return t


def _proj_text(p) -> str:
    if isinstance(p, dict):
        return p.get("title", "") + " " + p.get("tech", "") + " " + " ".join(p.get("bullets", []))
    proj = br.P.get(p, {})
    return proj.get("title", "") + " " + proj.get("tech", "") + " " + " ".join(proj.get("bullets", []))


def _proj_title(p) -> str:
    return p.get("title", "") if isinstance(p, dict) else br.P.get(p, {}).get("title", p)


def tailor(jd_text: str, company: str = "", role_title: str = "",
           base_role: str | None = None, make_pdf: bool = True) -> dict:
    """Build a JD-tailored resume (.docx + .pdf) and return a summary of changes."""
    jd_text = (jd_text or "").strip()
    if not jd_text:
        raise ValueError("jd_text is empty — paste the job requirements/responsibilities.")

    # weight the role title heavily when choosing the base resume
    detect_text = ((role_title + " ") * 4) + jd_text
    auto_role, track = pick_role(detect_text)
    role = base_role if (base_role in br.ROLES) else auto_role
    cfg = copy.deepcopy(br.ROLES[role])
    jd_low = jd_text.lower()
    matched, gaps = analyze_jd(jd_text)
    matched_set = set(matched)

    # 1) headline = the role you're applying for, cleaned so it never over-claims
    #    a seniority level (no "Senior"/"III") and falls back to a sane default.
    cfg["headline"] = clean_headline(role_title, cfg["headline"])

    # 2) reorder skill rows by JD relevance, prepend a "Most relevant" row
    def row_score(val: str) -> int:
        return sum(1 for s in matched_set if s in val.lower())
    cfg["skills"] = sorted(cfg["skills"], key=lambda kv: -row_score(kv[1]))
    if matched:
        pretty = ", ".join(display_skill(s) for s in matched[:14])
        cfg["skills"] = [("Most relevant", pretty)] + cfg["skills"]

    # 3) reorder projects by SEMANTIC relevance to the JD (embed JD + each
    #    project, cosine-rank). Neural embeddings if available, else TF-IDF.
    items = cfg.get("custom_projects") or cfg.get("projects") or []
    ordered = []
    if items:
        texts = [_proj_text(p) for p in items]
        sims = embedding.rank(jd_text, texts)
        order = sorted(range(len(items)), key=lambda i: -sims[i])
        ranked_items = [items[i] for i in order]
        if cfg.get("custom_projects"):
            cfg["custom_projects"] = ranked_items
        else:
            cfg["projects"] = ranked_items
        ordered = [{"title": _proj_title(items[i]), "score": round(sims[i], 3)}
                   for i in order]

    # 4) filename + render docx into tailored/
    safe_co = re.sub(r"[^A-Za-z0-9]+", "_", (company or "Company")).strip("_") or "Company"
    fname = f"Resume_Janadri_Yalla_Yashwanth_{safe_co}_{role}"
    cfg["filename"] = os.path.join("tailored", fname)  # relative to br.OUT_DIR
    os.makedirs(TAILORED_DIR, exist_ok=True)
    out_path = br.build_resume(role, cfg)

    # also render a PDF (high-fidelity, via MS Word)
    pdf_path = to_pdf(out_path) if make_pdf else None

    # honest fit signal: combine SKILL coverage AND the EXPERIENCE requirement.
    total = len(matched) + len(gaps)
    coverage = round(len(matched) / total, 2) if total else 0.0
    gap_disp = ", ".join(display_skill(g) for g in gaps[:6])

    # skill tier: 2=strong, 1=moderate, 0=weak
    if coverage >= 0.65 and len(matched) >= 6:
        tier = 2
    elif coverage >= 0.45 and len(matched) >= 4:
        tier = 1
    else:
        tier = 0

    # experience check — a senior posting is a stretch no matter how well skills match
    exp = PROFILE["experience_years"]
    req_yrs = matcher.required_years(jd_low)
    exp_gap, exp_msg = False, ""
    if req_yrs is not None and req_yrs - exp >= 2.5:
        tier = 0; exp_gap = True
        exp_msg = (f"⚠️ Needs ~{req_yrs}+ yrs experience; you have ~{exp} yr — this is a "
                   f"senior posting above your level. ")
    elif req_yrs is not None and req_yrs - exp >= 1.0:
        tier = max(0, tier - 1); exp_gap = True
        exp_msg = f"Asks ~{req_yrs} yrs vs your ~{exp} yr — a stretch. "

    fit = ["weak", "moderate", "strong"][tier]
    if exp_gap and tier == 0:
        fit_note = exp_msg + (f"Skills overlap is {int(coverage*100)}%, but the experience bar is the blocker."
                              if coverage >= 0.45 else f"Gaps: {gap_disp}.")
    elif tier == 2:
        fit_note = "Strong fit — you cover the skills and the experience bar fits."
    elif tier == 1:
        fit_note = exp_msg + f"Partial fit — lead with matched strengths; gaps: {gap_disp}."
    else:
        fit_note = exp_msg + (f"Weak fit — role centers on skills you don't list ({gap_disp})."
                              if gaps else "Weak fit.")

    return {
        "company": company,
        "role_title": role_title.strip() or cfg["headline"],
        "base_role": role,
        "base_role_label": ROLE_LABELS.get(role, role),
        "auto_role": auto_role,
        "track": track,
        "matched_skills": [display_skill(s) for s in matched],
        "matched_count": len(matched),
        "gaps": [display_skill(g) for g in gaps],
        "gap_count": len(gaps),
        "coverage": coverage,
        "fit": fit,
        "fit_note": fit_note,
        "required_years": req_yrs,
        "your_years": exp,
        "experience_gap": exp_gap,
        "ordered_projects": ordered,
        "embed_backend": embedding.backend_label(),
        "summary": cfg["summary"],
        "file": fname + ".docx",
        "pdf_file": (fname + ".pdf") if pdf_path else None,
        "path": out_path,
        "pdf_path": pdf_path,
    }
