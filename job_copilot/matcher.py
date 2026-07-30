# -*- coding: utf-8 -*-
"""Score and filter jobs against the candidate profile.

Match score (0-100) = weighted blend of:
  * similarity  - cosine between your profile and the job text. Uses NEURAL
                  embeddings (max over your strength-facets) when available,
                  else TF-IDF. Jobs are batch-embedded in score_all().
  * skills      - fraction of your skills that appear in the job
  * title       - whether a target-title phrase is in the job title/body

On top of the score, hard eligibility rules drop jobs that demand more years
than you have or are senior/staff/principal level. Each job also gets a
recommended resume (which of your tailored .docx files to upload).
"""
from __future__ import annotations
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from . import config
from . import embedding
from .profile import (PROFILE, SKILLS, CORE_STRENGTHS, RESUME_CORPUS,
                      RESUME_FOR_TRACK, PROFILE_FACETS)

# Pre-fit a vectorizer on the resume corpus once; transform jobs against it.
_VEC = TfidfVectorizer(stop_words="english", ngram_range=(1, 2),
                       min_df=1, sublinear_tf=True)
_VEC.fit([RESUME_CORPUS])
_RESUME_VEC = _VEC.transform([RESUME_CORPUS])

# Neural matching: embed your strength-facets once; a job's similarity is its
# MAX cosine over these (so matching any one strength scores high).
_NEURAL = embedding.backend() == "neural"
_FACET_VECS = embedding.embed(PROFILE_FACETS) if _NEURAL else None


def backend_label() -> str:
    return embedding.backend_label()

_YEARS_RE = re.compile(
    r"(\d{1,2})\s*\+?\s*(?:to|-|–|—)?\s*\d{0,2}\s*(?:\+)?\s*(?:years?|yrs?)\b",
    re.IGNORECASE)

# Level is detected from the TITLE only — scanning the full description catches
# boilerplate ("we hire interns", "entry-level friendly") and mislabels roles.
_INTERN_RE = re.compile(
    r"\b(intern|interns|internship|apprentice|apprenticeship|co-?op|"
    r"industrial trainee|summer (?:analyst|associate|intern))\b", re.IGNORECASE)
_NEWGRAD_RE = re.compile(
    r"\b(new ?grad(?:uate)?|graduate (?:engineer|programme|program|trainee|analyst|developer)|"
    r"campus|university grad|fresher|entry[ -]level|early[ -]career|trainee|"
    r"associate engineer)\b", re.IGNORECASE)
_SENIOR_RE = re.compile(
    r"\b(staff|principal|director|head of|lead|senior|sr\.?|architect|manager|"
    r"vp|distinguished|fellow)\b", re.IGNORECASE)


def detect_level(title: str, req_years, exp_hint: str = "") -> str:
    """intern | new_grad | junior | mid | senior — from the title (+ ATS hint)."""
    t = title or ""
    hint = (exp_hint or "").upper()
    if _INTERN_RE.search(t) or hint == "INTERNSHIP":
        return "intern"
    if _NEWGRAD_RE.search(t) or hint in ("ENTRY_LEVEL", "STUDENT", "GRADUATE"):
        return "new_grad"
    if _SENIOR_RE.search(t) or hint in ("DIRECTOR", "EXECUTIVE", "SENIOR"):
        return "senior"
    if req_years is not None and req_years >= 3:
        return "mid"
    return "junior"


def _job_text(job: dict) -> str:
    return " ".join([
        job.get("title", ""), job.get("title", ""),  # weight the title twice
        job.get("department", ""), job.get("location", ""),
        job.get("description", ""),
    ]).lower()


def required_years(text: str) -> int | None:
    """Smallest 'N years' figure mentioned (the entry bar). None if unstated."""
    nums = []
    for m in _YEARS_RE.finditer(text):
        try:
            n = int(m.group(1))
        except (TypeError, ValueError):
            continue
        # ignore noise like "5 years ago" contexts that are too large
        if 0 < n <= 25:
            nums.append(n)
    return min(nums) if nums else None


def matched_skills(text: str) -> list[str]:
    hits = []
    for sk in SKILLS:
        # word-ish boundary match; skills with punctuation matched literally
        if re.search(r"(?<![a-z0-9])" + re.escape(sk) + r"(?![a-z0-9])", text):
            hits.append(sk)
    return hits


def detect_track(text: str) -> str:
    t = text
    def has(*kw):
        return any(k in t for k in kw)
    if has("drone", "uav", "ardupilot", "px4", "mavlink", "flight software",
           "autonomy", "autonomous", "robotics", "slam", "perception"):
        # robotics/perception leans CV unless it's clearly flight/controls
        if has("flight", "ardupilot", "mavlink", "px4", "drone", "uav"):
            return "drone"
        return "cv_ml"
    if has("computer vision", "deep learning", "machine learning", " ml ",
           "pytorch", "segmentation", "geospatial", "remote sensing", "gis",
           "detection", "neural", "data scientist", "applied scientist"):
        return "cv_ml"
    if has("full stack", "fullstack", "frontend", "front-end", "react"):
        return "fullstack"
    if has("devops", "sre", "site reliability", "infrastructure", "platform",
           "kubernetes", "cloud engineer"):
        return "devops"
    if has("backend", "back-end", "fastapi", "django", "api", "microservice",
           "python engineer", "server"):
        return "backend"
    return "swe"


def score_job(job: dict, sim: float | None = None) -> dict:
    """Return job augmented with score, eligibility and explanation fields.

    `sim` (0..1) may be supplied by score_all() from a batch neural embed; if
    omitted we fall back to a per-job TF-IDF cosine.
    """
    text = _job_text(job)
    title = job.get("title", "").lower()

    # 1) similarity (precomputed neural, or per-job TF-IDF fallback)
    if sim is None:
        jv = _VEC.transform([text])
        sim = float(cosine_similarity(_RESUME_VEC, jv)[0][0])
    sim = max(0.0, min(1.0, sim))  # clamp (neural cosine can go negative)

    # 2) skills
    hits = matched_skills(text)
    core_hits = [s for s in CORE_STRENGTHS if s in text]
    skill_score = min(1.0, len(hits) / 8.0)
    if core_hits:
        skill_score = min(1.0, skill_score + 0.1 * len(core_hits))

    # 3) title relevance
    title_hit = any(tt.strip() and tt in title for tt in PROFILE["target_titles"])
    body_hit = any(tt.strip() and tt in text for tt in PROFILE["target_titles"])
    title_score = 1.0 if title_hit else (0.4 if body_hit else 0.0)

    w = config.WEIGHTS
    score = 100.0 * (w["similarity"] * sim + w["skills"] * skill_score
                     + w["title"] * title_score)

    # --- eligibility rules + adjustments ---
    reasons: list[str] = []
    eligible = True

    exp = PROFILE["experience_years"]
    req_yrs = required_years(text)
    if req_yrs is not None and req_yrs > PROFILE["max_required_years"]:
        eligible = False
        reasons.append(f"needs ~{req_yrs}+ yrs (you have ~{exp})")
    elif req_yrs is not None:
        reasons.append(f"~{req_yrs} yrs ok")

    if any(b in title for b in PROFILE["seniority_block"]):
        eligible = False
        reasons.append("senior/lead+ title")

    if any(s in title for s in PROFILE["seniority_soft"]):
        score = max(0.0, score - config.SENIOR_SOFT_PENALTY)
        reasons.append("'senior' (-penalty)")

    # location: soft only (remote / international ok)
    loc = (job.get("location", "") or "").lower()
    loc_ok = (job.get("remote") or not loc
              or any(k in loc for k in PROFILE["locations_ok"]))
    if not loc_ok:
        reasons.append(f"location: {job.get('location','?')}")

    if score < config.ELIGIBLE_MIN_SCORE:
        eligible = False

    track = detect_track(text)
    level = detect_level(job.get("title", ""), req_yrs)
    early_career = level in ("intern", "new_grad") or (req_yrs is not None and req_yrs <= 1)
    if level == "intern":
        reasons.append("🎓 internship")
    elif level == "new_grad":
        reasons.append("🎓 early-career")
    job = dict(job)
    job.update({
        "score": round(score, 1),
        "eligible": eligible,
        "similarity": round(sim, 3),
        "skill_hits": hits,
        "skill_hit_count": len(hits),
        "core_hits": core_hits,
        "required_years": req_yrs,
        "location_ok": loc_ok,
        "track": track,
        "level": level,
        "early_career": early_career,
        "recommended_resume": RESUME_FOR_TRACK.get(track, RESUME_FOR_TRACK["swe"]),
        "reasons": reasons,
    })
    return job


def score_all(jobs: list[dict]) -> list[dict]:
    sims: list[float | None] = [None] * len(jobs)
    if _NEURAL and jobs and _FACET_VECS is not None:
        # batch-embed every job once, then similarity = max cosine over facets
        texts = [_job_text(j)[:1500] for j in jobs]  # MiniLM only reads ~256 tokens
        job_vecs = embedding.embed(texts)            # (N, D), L2-normalized
        if job_vecs is not None:
            cos = job_vecs @ _FACET_VECS.T           # (N, F) cosine (both normalized)
            sims = [float(row.max()) for row in cos]
    scored = [score_job(j, sim=sims[i]) for i, j in enumerate(jobs)]
    scored.sort(key=lambda j: j["score"], reverse=True)
    return scored
