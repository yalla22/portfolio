# -*- coding: utf-8 -*-
"""Job fetchers for public, ToS-clean ATS endpoints.

Each fetcher returns a list of normalized job dicts:
    {
      id, source, company, title, location, remote(bool),
      url, description, posted, department
    }

Every fetcher is wrapped so one failing board never aborts a refresh.
"""
from __future__ import annotations
import html
import os
import re
import httpx

from . import config

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"[ \t\r\f\v]+")


def _strip_html(s: str | None) -> str:
    if not s:
        return ""
    s = html.unescape(s)
    s = _TAG_RE.sub(" ", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\n{3,}", "\n\n", s)
    s = "\n".join(_WS_RE.sub(" ", ln).strip() for ln in s.splitlines())
    return s.strip()


def _looks_remote(*texts: str) -> bool:
    blob = " ".join(t.lower() for t in texts if t)
    return any(k in blob for k in ("remote", "anywhere", "work from home", "wfh"))


# Word-boundary matchers so "india" doesn't match "Indiana", etc.
_SOUTH_RE = re.compile(
    r"\b(" + "|".join(re.escape(k) for k in config.SOUTH_INDIA_KEYWORDS) + r")\b")
_INDIA_RE = re.compile(r"\bindia\b")
_NONSOUTH_RE = re.compile(
    r"\b(" + "|".join(re.escape(m) for m in config.NON_SOUTH_METROS) + r")\b")


def in_south_india(job: dict) -> bool:
    """True if a job's location is in South India (or India-remote, if enabled)."""
    if not config.LOCATION_FILTER_ENABLED:
        return True
    loc = (job.get("location") or "").lower()
    if not loc:
        return False
    if _SOUTH_RE.search(loc):
        return True
    # India-wide / remote-India role with no *other* (non-South) metro named.
    if config.INCLUDE_INDIA_REMOTE and _INDIA_RE.search(loc) and not _NONSOUTH_RE.search(loc):
        return True
    return False


def _client() -> httpx.Client:
    return httpx.Client(timeout=config.HTTP_TIMEOUT, headers=config.HTTP_HEADERS,
                        follow_redirects=True)


# --- Greenhouse -------------------------------------------------------------
def fetch_greenhouse(token: str, company: str) -> list[dict]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true"
    out: list[dict] = []
    with _client() as c:
        data = c.get(url).json()
    for j in data.get("jobs", []):
        loc = (j.get("location") or {}).get("name", "") or ""
        desc = _strip_html(j.get("content"))
        depts = ", ".join(d.get("name", "") for d in j.get("departments", []) if d)
        out.append({
            "id": f"gh:{token}:{j.get('id')}",
            "source": "greenhouse",
            "company": company,
            "title": j.get("title", "").strip(),
            "location": loc.strip(),
            "remote": _looks_remote(loc, j.get("title", "")),
            "url": j.get("absolute_url", ""),
            "description": desc,
            "posted": j.get("updated_at", "") or j.get("first_published", ""),
            "department": depts,
        })
    return out


# --- Lever ------------------------------------------------------------------
def fetch_lever(token: str, company: str) -> list[dict]:
    url = f"https://api.lever.co/v0/postings/{token}?mode=json"
    with _client() as c:
        data = c.get(url).json()
    out: list[dict] = []
    for j in data if isinstance(data, list) else []:
        cats = j.get("categories", {}) or {}
        loc = cats.get("location", "") or ""
        desc = _strip_html(j.get("descriptionPlain") or j.get("description"))
        # fold the requirement/responsibility lists into the body text
        for lst in j.get("lists", []) or []:
            desc += "\n" + _strip_html(lst.get("text", "")) + " " + _strip_html(lst.get("content", ""))
        wt = (cats.get("commitment", "") or "") + " " + (cats.get("workplaceType", "") or "")
        out.append({
            "id": f"lv:{token}:{j.get('id')}",
            "source": "lever",
            "company": company,
            "title": (j.get("text") or "").strip(),
            "location": loc.strip(),
            "remote": _looks_remote(loc, wt, j.get("text", "")),
            "url": j.get("hostedUrl", ""),
            "description": desc.strip(),
            "posted": str(j.get("createdAt", "")),
            "department": cats.get("team", "") or cats.get("department", ""),
        })
    return out


# --- Ashby ------------------------------------------------------------------
def fetch_ashby(token: str, company: str) -> list[dict]:
    url = f"https://api.ashbyhq.com/posting-api/job-board/{token}?includeCompensation=true"
    with _client() as c:
        data = c.get(url).json()
    out: list[dict] = []
    for j in data.get("jobs", []):
        loc = j.get("location", "") or ""
        desc = _strip_html(j.get("descriptionPlain") or j.get("descriptionHtml"))
        out.append({
            "id": f"as:{token}:{j.get('id') or j.get('jobUrl')}",
            "source": "ashby",
            "company": company,
            "title": (j.get("title") or "").strip(),
            "location": loc.strip(),
            "remote": bool(j.get("isRemote")) or _looks_remote(loc),
            "url": j.get("jobUrl") or j.get("applyUrl", ""),
            "description": desc,
            "posted": j.get("publishedAt", "") or "",
            "department": j.get("department", "") or j.get("team", ""),
        })
    return out


# --- SmartRecruiters (many enterprise careers portals) ----------------------
def fetch_smartrecruiters(company: str, label: str) -> list[dict]:
    url = f"https://api.smartrecruiters.com/v1/companies/{company}/postings?limit=100"
    with _client() as c:
        data = c.get(url).json()
    out: list[dict] = []
    for j in data.get("content", []):
        loc = j.get("location", {}) or {}
        locstr = ", ".join(x for x in [loc.get("city"), loc.get("region"),
                                       loc.get("country")] if x)
        dept = (j.get("department") or {}).get("label", "")
        func = (j.get("function") or {}).get("label", "")
        exp = (j.get("experienceLevel") or {}).get("id", "")  # e.g. INTERNSHIP, ENTRY_LEVEL
        emp = (j.get("typeOfEmployment") or {}).get("label", "")
        jid = j.get("id")
        out.append({
            "id": f"sr:{company}:{jid}",
            "source": "smartrecruiters",
            "company": label or (j.get("company") or {}).get("name", ""),
            "title": (j.get("name") or "").strip(),
            "location": locstr,
            "remote": bool(loc.get("remote")) or _looks_remote(locstr),
            "url": j.get("postingUrl") or j.get("applyUrl")
                   or f"https://jobs.smartrecruiters.com/{company}/{jid}",
            # experienceLevel/typeOfEmployment folded in so level detection sees them
            "description": f"{func} {dept} {exp} {emp}".strip(),
            "posted": j.get("releasedDate", "") or "",
            "department": dept,
        })
    return out


# --- Workday (most big enterprise careers portals) --------------------------
def fetch_workday(tenant: str, dc: str, site: str, label: str) -> list[dict]:
    """Query a Workday tenant by South-India city (searchText) and normalize.

    Workday has no public per-board list, so we search each city term and
    paginate, capped by config.WORKDAY_MAX_PER_TERM to bound request count.
    """
    host = f"{tenant}.{dc}.myworkdayjobs.com"
    api = f"https://{host}/wday/cxs/{tenant}/{site}/jobs"
    pub = f"https://{host}/en-US/{site}"
    terms = getattr(config, "WORKDAY_SEARCH_TERMS", ["Bengaluru", "Hyderabad"])
    cap = getattr(config, "WORKDAY_MAX_PER_TERM", 80)
    out: dict[str, dict] = {}
    with _client() as c:
        for term in terms:
            offset = 0
            while offset < cap:
                r = c.post(api, json={"appliedFacets": {}, "limit": 20,
                                      "offset": offset, "searchText": term})
                if r.status_code != 200:
                    break
                j = r.json()
                posts = j.get("jobPostings", []) or []
                if not posts:
                    break
                for p in posts:
                    path = p.get("externalPath", "") or ""
                    key = path or p.get("title", "")
                    loc = p.get("locationsText", "") or ""
                    # ensure the searched city shows so the scope filter keeps it
                    if term.lower() not in loc.lower():
                        loc = (f"{loc} ({term}, India)" if loc else f"{term}, India")
                    bullets = " ".join(p.get("bulletFields", []) or [])
                    out[key] = {
                        "id": f"wd:{tenant}:{key}",
                        "source": "workday",
                        "company": label,
                        "title": (p.get("title") or "").strip(),
                        "location": loc.strip(),
                        "remote": _looks_remote(loc, p.get("title", "")),
                        "url": (pub + path) if path else pub,
                        "description": f"{p.get('title','')} {bullets}".strip(),
                        "posted": p.get("postedOn", "") or "",
                        "department": "",
                    }
                total = j.get("total", 0) or 0
                offset += 20
                if offset >= total:
                    break
    return list(out.values())


# --- RemoteOK (no key) ------------------------------------------------------
def fetch_remoteok() -> list[dict]:
    out: list[dict] = []
    with _client() as c:
        for tag in config.REMOTEOK_TAGS:
            try:
                data = c.get(f"https://remoteok.com/api?tags={tag}").json()
            except Exception:
                continue
            for j in data:
                if not isinstance(j, dict) or not j.get("id"):
                    continue  # first element is a legal/meta notice
                title = j.get("position") or j.get("title") or ""
                desc = _strip_html(j.get("description"))
                tags = ", ".join(j.get("tags", []) or [])
                out.append({
                    "id": f"ro:{j.get('id')}",
                    "source": "remoteok",
                    "company": j.get("company", "").strip(),
                    "title": title.strip(),
                    "location": j.get("location", "") or "Remote",
                    "remote": True,
                    "url": j.get("url", ""),
                    "description": (desc + "\nTags: " + tags).strip(),
                    "posted": j.get("date", ""),
                    "department": tags,
                })
    return out


# --- Adzuna (optional, needs free API key in env) ---------------------------
def fetch_adzuna() -> list[dict]:
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")
    if not (app_id and app_key):
        return []
    out: list[dict] = []
    with _client() as c:
        for what, where in config.ADZUNA_QUERIES:
            url = (f"https://api.adzuna.com/v1/api/jobs/{config.ADZUNA_COUNTRY}/search/1"
                   f"?app_id={app_id}&app_key={app_key}&results_per_page=50"
                   f"&what={httpx.QueryParams({'w': what})['w']}&where={where}"
                   f"&content-type=application/json")
            try:
                data = c.get(url).json()
            except Exception:
                continue
            for j in data.get("results", []):
                loc = (j.get("location") or {}).get("display_name", "")
                out.append({
                    "id": f"az:{j.get('id')}",
                    "source": "adzuna",
                    "company": (j.get("company") or {}).get("display_name", ""),
                    "title": j.get("title", "").strip(),
                    "location": loc,
                    "remote": _looks_remote(loc, j.get("title", ""), j.get("description", "")),
                    "url": j.get("redirect_url", ""),
                    "description": _strip_html(j.get("description")),
                    "posted": j.get("created", ""),
                    "department": j.get("category", {}).get("label", ""),
                })
    return out


# --- orchestrator -----------------------------------------------------------
def fetch_all(verbose: bool = True) -> tuple[list[dict], list[str]]:
    """Return (jobs, log_lines). Never raises for a single bad source."""
    jobs: list[dict] = []
    log: list[str] = []

    def run(label, fn, *args):
        try:
            got = fn(*args)
            jobs.extend(got)
            line = f"  [ok]  {label:22} {len(got):4d} jobs"
        except Exception as e:  # noqa: BLE001
            line = f"  [ERR] {label:22} {type(e).__name__}: {e}"
        log.append(line)
        if verbose:
            print(line)

    for tok, name in config.GREENHOUSE_BOARDS:
        run(f"greenhouse/{tok}", fetch_greenhouse, tok, name)
    for tok, name in config.LEVER_BOARDS:
        run(f"lever/{tok}", fetch_lever, tok, name)
    for tok, name in config.ASHBY_BOARDS:
        run(f"ashby/{tok}", fetch_ashby, tok, name)
    for tok, name in getattr(config, "SMARTRECRUITERS_BOARDS", []):
        run(f"smartrecruiters/{tok}", fetch_smartrecruiters, tok, name)
    for tenant, dc, site, name in getattr(config, "WORKDAY_BOARDS", []):
        run(f"workday/{tenant}", fetch_workday, tenant, dc, site, name)
    if config.ENABLE_REMOTEOK:
        run("remoteok", fetch_remoteok)
    if os.environ.get("ADZUNA_APP_ID"):
        run("adzuna", fetch_adzuna)

    # keep only South-India jobs (location scope)
    raw_n = len(jobs)
    if config.LOCATION_FILTER_ENABLED:
        jobs = [j for j in jobs if in_south_india(j)]
        line = f"  location filter: kept {len(jobs)}/{raw_n} (South India)"
        log.append(line)
        if verbose:
            print(line)

    # de-dupe by id
    seen: dict[str, dict] = {}
    for j in jobs:
        seen[j["id"]] = j
    deduped = list(seen.values())
    log.append(f"  total fetched={raw_n}  in-scope unique={len(deduped)}")
    if verbose:
        print(log[-1])
    return deduped, log
