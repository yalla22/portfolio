# -*- coding: utf-8 -*-
"""FastAPI app: a ranked job dashboard + a small JSON API + status tracker.

Run:  python -m uvicorn job_copilot.app:app --reload --port 8000
Then open http://127.0.0.1:8000
"""
from __future__ import annotations
import os

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import store
from . import sources
from . import matcher
from . import tailor as tailor_mod
from .profile import PROFILE, SKILLS, RESUME_FOR_TRACK
from . import config

app = FastAPI(title="Job Copilot", version="1.0")

_WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")


@app.on_event("startup")
def _startup():
    store.init_db()


# ---------------- API ----------------
@app.post("/api/refresh")
def api_refresh():
    raw, log = sources.fetch_all(verbose=False)
    scored = matcher.score_all(raw)
    result = store.upsert_jobs(scored)
    return {"fetched": len(raw), **result, "log": log, "stats": store.stats()}


@app.get("/api/jobs")
def api_jobs(min_score: float = 0, source: str | None = None,
            status: str | None = None, eligible_only: bool = False,
            track: str | None = None, q: str | None = None,
            level: str | None = None, early_career: bool = False,
            sort: str = "score", limit: int = 300, offset: int = 0):
    return store.query_jobs(min_score=min_score, source=source, status=status,
                            eligible_only=eligible_only, track=track, q=q,
                            level=level, early_career=early_career,
                            sort=sort, limit=limit, offset=offset)


@app.get("/api/stats")
def api_stats():
    return store.stats()


@app.get("/api/analytics")
def api_analytics():
    return store.analytics()


@app.get("/api/profile")
def api_profile():
    return {
        "name": PROFILE["name"],
        "email": PROFILE["email"],
        "phone": PROFILE["phone"],
        "experience_years": PROFILE["experience_years"],
        "max_required_years": PROFILE["max_required_years"],
        "home_city": PROFILE["home_city"],
        "remote_ok": PROFILE["remote_ok"],
        "open_to_international": PROFILE["open_to_international"],
        "locations_ok": PROFILE["locations_ok"],
        "skills": sorted(SKILLS),
        "weights": config.WEIGHTS,
        "eligible_min_score": config.ELIGIBLE_MIN_SCORE,
        "resumes": RESUME_FOR_TRACK,
    }


class StatusUpdate(BaseModel):
    status: str | None = None
    resume_version: str | None = None
    notes: str | None = None
    contact: str | None = None
    follow_up_at: str | None = None


@app.post("/api/jobs/{job_id:path}/status")
def api_status(job_id: str, body: StatusUpdate):
    try:
        return store.update_status(job_id, **body.model_dump())
    except ValueError as e:
        raise HTTPException(400, str(e))


# ---------------- Resume tailoring ----------------
class TailorReq(BaseModel):
    jd_text: str | None = None
    company: str | None = ""
    role_title: str | None = ""
    base_role: str | None = None
    job_id: str | None = None  # if given, pull JD/company/title from a stored job


@app.post("/api/tailor")
def api_tailor(body: TailorReq):
    company = body.company or ""
    role_title = body.role_title or ""
    jd_text = body.jd_text or ""
    if body.job_id:
        j = store.get_job(body.job_id)
        if not j:
            raise HTTPException(404, "job not found")
        jd_text = jd_text or j.get("description") or j.get("title") or ""
        company = company or j.get("company") or ""
        role_title = role_title or j.get("title") or ""
    try:
        res = tailor_mod.tailor(jd_text, company=company, role_title=role_title,
                                base_role=body.base_role or None)
    except ValueError as e:
        raise HTTPException(400, str(e))
    res["download_url"] = f"/api/tailor/download?file={res['file']}"
    res["pdf_download_url"] = (f"/api/tailor/download?file={res['pdf_file']}"
                              if res.get("pdf_file") else None)
    res.pop("path", None)      # don't leak absolute server paths
    res.pop("pdf_path", None)
    return res


@app.get("/api/tailor/roles")
def api_tailor_roles():
    return [{"key": k, "label": v} for k, v in tailor_mod.ROLE_LABELS.items()
            if k in tailor_mod.br.ROLES]


@app.get("/api/tailor/download")
def api_tailor_download(file: str):
    # serve only basenames from the tailored dir (no path traversal)
    safe = os.path.basename(file)
    path = os.path.join(tailor_mod.TAILORED_DIR, safe)
    if not (safe.endswith((".docx", ".pdf")) and os.path.isfile(path)):
        raise HTTPException(404, "file not found")
    media = ("application/pdf" if safe.endswith(".pdf")
             else "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    return FileResponse(path, filename=safe, media_type=media)


# ---------------- Static SPA (mounted last so /api/* wins) ----------------
app.mount("/", StaticFiles(directory=_WEB_DIR, html=True), name="web")

