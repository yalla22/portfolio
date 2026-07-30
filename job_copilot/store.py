# -*- coding: utf-8 -*-
"""SQLite persistence: scored jobs + an application tracker.

One file, ``copilot.db``, lives next to this module. Two tables:
  jobs          - every scored posting we have seen (upserted on refresh)
  applications  - your status per job (saved/applied/interview/offer/...)
"""
from __future__ import annotations
import json
import os
import sqlite3
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "copilot.db")

STATUSES = ["new", "saved", "applied", "screening", "interview",
            "offer", "rejected", "skipped"]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as c:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id            TEXT PRIMARY KEY,
                source        TEXT,
                company       TEXT,
                title         TEXT,
                location      TEXT,
                remote        INTEGER,
                url           TEXT,
                department    TEXT,
                posted        TEXT,
                description   TEXT,
                score         REAL,
                eligible      INTEGER,
                similarity    REAL,
                skill_hits    TEXT,
                skill_hit_count INTEGER,
                required_years  INTEGER,
                track         TEXT,
                level         TEXT,
                early_career  INTEGER,
                recommended_resume TEXT,
                reasons       TEXT,
                first_seen    TEXT,
                last_seen     TEXT
            );
            CREATE TABLE IF NOT EXISTS applications (
                job_id        TEXT PRIMARY KEY,
                status        TEXT DEFAULT 'new',
                resume_version TEXT,
                contact       TEXT,
                notes         TEXT,
                applied_at    TEXT,
                follow_up_at  TEXT,
                updated_at    TEXT,
                FOREIGN KEY(job_id) REFERENCES jobs(id)
            );
            CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score DESC);
            """
        )
        # migrations for DBs created before these columns existed
        for col, typ in (("level", "TEXT"), ("early_career", "INTEGER")):
            try:
                c.execute(f"ALTER TABLE jobs ADD COLUMN {col} {typ}")
            except sqlite3.OperationalError:
                pass


def upsert_jobs(scored: list[dict]) -> dict:
    """Insert/update scored jobs. Returns {'new': n, 'updated': m}."""
    init_db()
    new = updated = 0
    now = _now()
    with connect() as c:
        for j in scored:
            exists = c.execute("SELECT 1 FROM jobs WHERE id=?", (j["id"],)).fetchone()
            row = (
                j["id"], j.get("source"), j.get("company"), j.get("title"),
                j.get("location"), int(bool(j.get("remote"))), j.get("url"),
                j.get("department"), j.get("posted"), j.get("description"),
                j.get("score"), int(bool(j.get("eligible"))), j.get("similarity"),
                json.dumps(j.get("skill_hits", [])), j.get("skill_hit_count"),
                j.get("required_years"), j.get("track"),
                j.get("level"), int(bool(j.get("early_career"))),
                j.get("recommended_resume"), json.dumps(j.get("reasons", [])),
            )
            if exists:
                c.execute(
                    """UPDATE jobs SET source=?,company=?,title=?,location=?,remote=?,
                       url=?,department=?,posted=?,description=?,score=?,eligible=?,
                       similarity=?,skill_hits=?,skill_hit_count=?,required_years=?,
                       track=?,level=?,early_career=?,recommended_resume=?,reasons=?,last_seen=?
                       WHERE id=?""",
                    row[1:] + (now, j["id"]),
                )
                updated += 1
            else:
                c.execute(
                    """INSERT INTO jobs (id,source,company,title,location,remote,url,
                       department,posted,description,score,eligible,similarity,
                       skill_hits,skill_hit_count,required_years,track,level,early_career,
                       recommended_resume,reasons,first_seen,last_seen)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    row + (now, now),
                )
                # seed a tracker row so every job is trackable
                c.execute(
                    "INSERT OR IGNORE INTO applications (job_id,status,updated_at) VALUES (?,?,?)",
                    (j["id"], "new", now),
                )
                new += 1
    return {"new": new, "updated": updated}


_SORTS = {
    "score":  "j.score DESC",
    "recent": "j.first_seen DESC, j.score DESC",
    "skills": "j.skill_hit_count DESC, j.score DESC",
    "company": "j.company ASC, j.score DESC",
}


def reset_jobs(keep_tracked: bool = True) -> dict:
    """Clear stored jobs (e.g. after changing the location scope / sources).

    keep_tracked=True preserves jobs you've already acted on (status != 'new')
    and their application rows, so a re-scope doesn't wipe your pipeline.
    """
    init_db()
    with connect() as c:
        if keep_tracked:
            tracked = [r[0] for r in c.execute(
                "SELECT job_id FROM applications WHERE status IS NOT NULL AND status!='new'")]
            keep = set(tracked)
            placeholders = ",".join("?" * len(keep)) or "''"
            removed = c.execute(
                f"SELECT COUNT(*) FROM jobs WHERE id NOT IN ({placeholders})",
                list(keep)).fetchone()[0]
            c.execute(f"DELETE FROM jobs WHERE id NOT IN ({placeholders})", list(keep))
            c.execute(f"DELETE FROM applications WHERE job_id NOT IN ({placeholders}) "
                      f"AND (status IS NULL OR status='new')", list(keep))
        else:
            removed = c.execute("SELECT COUNT(*) FROM jobs").fetchone()[0]
            c.execute("DELETE FROM jobs")
            c.execute("DELETE FROM applications")
    return {"removed": removed, "kept_tracked": keep_tracked}


def query_jobs(min_score: float = 0.0, source: str | None = None,
               status: str | None = None, eligible_only: bool = False,
               track: str | None = None, q: str | None = None,
               level: str | None = None, early_career: bool = False,
               sort: str = "score", limit: int = 500, offset: int = 0) -> list[dict]:
    init_db()
    sql = [
        "SELECT j.*, a.status, a.resume_version, a.notes, a.contact,",
        "a.applied_at, a.follow_up_at",
        "FROM jobs j LEFT JOIN applications a ON a.job_id=j.id",
        "WHERE j.score >= ?",
    ]
    params: list = [min_score]
    if source:
        sql.append("AND j.source=?"); params.append(source)
    if track:
        sql.append("AND j.track=?"); params.append(track)
    if eligible_only:
        sql.append("AND j.eligible=1")
    if status:
        sql.append("AND a.status=?"); params.append(status)
    if q:
        like = f"%{q.strip()}%"
        sql.append("AND (j.title LIKE ? OR j.company LIKE ? OR j.location LIKE ?)")
        params += [like, like, like]
    if level:
        sql.append("AND j.level=?"); params.append(level)
    if early_career:
        sql.append("AND j.early_career=1")
    sql.append("ORDER BY " + _SORTS.get(sort, _SORTS["score"]))
    sql.append("LIMIT ? OFFSET ?"); params += [limit, offset]
    with connect() as c:
        rows = c.execute(" ".join(sql), params).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["skill_hits"] = json.loads(d.get("skill_hits") or "[]")
        d["reasons"] = json.loads(d.get("reasons") or "[]")
        d["remote"] = bool(d.get("remote"))
        d["eligible"] = bool(d.get("eligible"))
        d["early_career"] = bool(d.get("early_career"))
        out.append(d)
    return out


def get_job(job_id: str) -> dict | None:
    rows = query_jobs(min_score=-1, limit=1_000_000)
    for r in rows:
        if r["id"] == job_id:
            return r
    return None


def update_status(job_id: str, status: str | None = None,
                  resume_version: str | None = None, notes: str | None = None,
                  contact: str | None = None, follow_up_at: str | None = None) -> dict:
    init_db()
    if status and status not in STATUSES:
        raise ValueError(f"status must be one of {STATUSES}")
    now = _now()
    with connect() as c:
        c.execute("INSERT OR IGNORE INTO applications (job_id,status,updated_at) VALUES (?,?,?)",
                  (job_id, "new", now))
        sets, params = [], []
        if status is not None:
            sets.append("status=?"); params.append(status)
            if status == "applied":
                sets.append("applied_at=COALESCE(applied_at,?)"); params.append(now)
        if resume_version is not None:
            sets.append("resume_version=?"); params.append(resume_version)
        if notes is not None:
            sets.append("notes=?"); params.append(notes)
        if contact is not None:
            sets.append("contact=?"); params.append(contact)
        if follow_up_at is not None:
            sets.append("follow_up_at=?"); params.append(follow_up_at)
        sets.append("updated_at=?"); params.append(now)
        params.append(job_id)
        c.execute(f"UPDATE applications SET {', '.join(sets)} WHERE job_id=?", params)
    return {"job_id": job_id, "status": status, "updated_at": now}


def stats() -> dict:
    init_db()
    with connect() as c:
        total = c.execute("SELECT COUNT(*) FROM jobs").fetchone()[0]
        eligible = c.execute("SELECT COUNT(*) FROM jobs WHERE eligible=1").fetchone()[0]
        by_status = {s: 0 for s in STATUSES}
        for row in c.execute("SELECT status, COUNT(*) c FROM applications GROUP BY status"):
            by_status[row["status"]] = row["c"]
    return {"jobs": total, "eligible": eligible, "by_status": by_status}


def analytics() -> dict:
    """Aggregates for the dashboard charts (computed in one pass)."""
    init_db()
    with connect() as c:
        jrows = c.execute(
            "SELECT score, eligible, track, source, company, level, early_career FROM jobs").fetchall()
        last_seen = c.execute("SELECT MAX(last_seen) FROM jobs").fetchone()[0]
        by_status = {s: 0 for s in STATUSES}
        for row in c.execute("SELECT status, COUNT(*) c FROM applications GROUP BY status"):
            by_status[row["status"]] = row["c"]

    n = len(jrows)
    eligible = sum(1 for r in jrows if r["eligible"])
    avg_score = round(sum(r["score"] or 0 for r in jrows) / n, 1) if n else 0
    elig_scores = [r["score"] or 0 for r in jrows if r["eligible"]]
    avg_elig = round(sum(elig_scores) / len(elig_scores), 1) if elig_scores else 0

    buckets = [0] * 10  # 0-9 .. 90-100
    for r in jrows:
        b = min(9, int((r["score"] or 0) // 10))
        buckets[b] += 1
    score_buckets = [{"label": f"{i*10}", "count": buckets[i]} for i in range(10)]

    def agg(field):
        d: dict[str, dict] = {}
        for r in jrows:
            k = r[field] or "—"
            e = d.setdefault(k, {"count": 0, "sum": 0.0, "eligible": 0})
            e["count"] += 1
            e["sum"] += r["score"] or 0
            e["eligible"] += 1 if r["eligible"] else 0
        return d

    by_track = [
        {"track": k, "count": v["count"], "eligible": v["eligible"],
         "avg": round(v["sum"] / v["count"], 1)}
        for k, v in sorted(agg("track").items(), key=lambda kv: -kv[1]["count"])
    ]
    by_source = [
        {"source": k, "count": v["count"], "eligible": v["eligible"]}
        for k, v in sorted(agg("source").items(), key=lambda kv: -kv[1]["count"])
    ]
    top_companies = [
        {"company": k, "count": v["count"], "eligible": v["eligible"],
         "avg": round(v["sum"] / v["count"], 1)}
        for k, v in sorted(agg("company").items(),
                           key=lambda kv: (-kv[1]["eligible"], -kv[1]["count"]))[:14]
    ]
    pipeline = [{"status": s, "count": by_status[s]} for s in STATUSES]

    level_order = ["intern", "new_grad", "junior", "mid", "senior"]
    lvl_counts: dict[str, int] = {}
    early = 0
    for r in jrows:
        lvl_counts[r["level"] or "?"] = lvl_counts.get(r["level"] or "?", 0) + 1
        if r["early_career"]:
            early += 1
    by_level = [{"level": k, "count": lvl_counts[k]}
                for k in level_order if k in lvl_counts]

    return {
        "kpis": {
            "jobs": n, "eligible": eligible, "avg_score": avg_score,
            "avg_eligible_score": avg_elig,
            "applied": by_status["applied"], "interview": by_status["interview"],
            "offer": by_status["offer"], "saved": by_status["saved"],
            "early_career": early, "last_seen": last_seen,
        },
        "by_level": by_level,
        "score_buckets": score_buckets,
        "by_track": by_track,
        "by_source": by_source,
        "top_companies": top_companies,
        "pipeline": pipeline,
        "by_status": by_status,
    }
