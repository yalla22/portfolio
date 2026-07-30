# 🛩️ Job Copilot

A personal, **ToS-clean** AI job-search assistant for Janadri Yalla Yashwanth.
It fetches real postings from **public ATS APIs** (no scraping, no CAPTCHA-bypass,
no anti-bot fight), scores every job against your profile, checks eligibility,
recommends which of your tailored resumes to use, and tracks application status.

It reuses your resume content directly from `../build_resumes.py` — one source of
truth for skills and projects.

> **What it does NOT do:** auto-submit applications, bypass anti-bot/CAPTCHA, or
> scrape LinkedIn/Naukri/Indeed. Those violate site terms and get accounts banned.
> You apply in ~5 minutes with the right resume already picked for you. The niche
> Indian drone/geo companies (Pixxel, SatSure, ideaForge…) sit behind bot-blocking
> ATSes — keep applying to those manually via the high-reply channels in
> `../HIGH_REPLY_CHANNELS.md`.

---

## Location scope: South India only

The Copilot keeps **only South-India jobs** — Karnataka, Telangana, Andhra Pradesh,
Tamil Nadu, Kerala, Puducherry — plus India-wide / remote-India roles you can work
from the South. Anything in Mumbai/Delhi/Pune/abroad is dropped.

Greenhouse/Lever/Ashby have no server-side location filter, so each board is fetched
in full then filtered client-side (`sources.in_south_india`, word-boundary matched so
"Indiana, USA" never sneaks in). Adzuna fetches South cities server-side via `where=`.

Tune in `config.py`:
- `LOCATION_FILTER_ENABLED = True` — turn the scope on/off.
- `INCLUDE_INDIA_REMOTE = True` — also keep "Remote - India" / "India" roles.
- `SOUTH_INDIA_KEYWORDS` / `NON_SOUTH_METROS` — the city/state lists.

## What's verified working

Boards seeded in `config.py` are skewed to **companies that actually hire in South
India** (Bengaluru / Hyderabad / Chennai); all return jobs today:

| Source | Companies | Base |
|---|---|---|
| Greenhouse | HighRadius, PhonePe, Zscaler, HackerRank, Rubrik, Druva, Postman, Groww, Commvault, Workato, Twilio, MongoDB, GitLab, Databricks, Samsara, Stripe, Elastic, Observe.ai | Bengaluru / Hyderabad |
| Ashby | Sarvam AI, Tekion, Atlan, OpenAI, Skydio | Bengaluru (Sarvam = Indian AI lab) |
| Lever | Mindtickle, Shield AI | Bengaluru / niche drone |
| Workday | NVIDIA, Salesforce, Adobe, eBay, Autodesk, Target | enterprise — Bengaluru / Hyderabad |
| SmartRecruiters | Continental, Visa | Bengaluru |
| Greenhouse (niche) | Planet Labs, Nuro, Verkada | geospatial / robotics / CV — rare India roles |
| Adzuna | *(optional, needs free key)* | true India keyword coverage, South cities |

A single `refresh` pulls ~5,800 postings, keeps **~870 South-India jobs** and flags
**~55 eligible**.

**Careers portals via ATS.** Greenhouse/Lever/Ashby/SmartRecruiters/Workday are the
engines behind most companies' "Careers" pages — that's how we read them cleanly. To
add any company, open its careers page and read the ATS from the URL, then drop it in
`config.py` (see "Add more companies" below). Portals on **bot-blocked Indian ATSes**
(Darwinbox, Keka, Brassring) can't be fetched — keep those manual.

> **Workday caveat:** the Workday list API returns titles only (no description), so
> those roles score lower and rarely pass the eligibility bar. They're still fetched
> and **searchable** — filter `source = workday` or search the company name (e.g.
> "NVIDIA") to browse them.

**Internships / early-career.** Every job is tagged `intern · new_grad · junior · mid ·
senior` (from the title). Filter the Jobs view by level, or tick **🎓 early-career**.
Note: pure tech internships are thin on these corporate boards — Internshala/LinkedIn
have more but block bots, and formal apprenticeships live on govt portals (NATS/NAPS).

---

## Setup

You already have everything (`fastapi`, `uvicorn`, `httpx`, `scikit-learn`, `numpy`).
If on a fresh machine:

```powershell
pip install -r job_copilot/requirements.txt
```

All commands run **from the `DISC_14` folder** (the one containing `job_copilot/`).

---

## Use it — CLI

```powershell
# 1) fetch + score + store everything
python -m job_copilot.cli refresh

# 2) see your best eligible matches
python -m job_copilot.cli top --min 55 --eligible

# filter by track (drone / cv_ml / backend / fullstack / devops / swe)
python -m job_copilot.cli top --min 50 --track drone --eligible

# 3) inspect one job in full (skills matched, why, recommended resume, description)
python -m job_copilot.cli show "as:skydio:<id>"

# 4) track your applications
python -m job_copilot.cli track "as:skydio:<id>" applied --resume Drone_Robotics --contact "HM name"
python -m job_copilot.cli track "as:skydio:<id>" interview --notes "call Tue 3pm"
python -m job_copilot.cli stats

# 5) early-career / internships
python -m job_copilot.cli top --min 0 --level intern
python -m job_copilot.cli top --min 40 --eligible      # juniors surface here

# 6) tailor a resume to a job (writes a .docx into tailored/)
python -m job_copilot.cli tailor --job "as:sarvam:<id>"
python -m job_copilot.cli tailor --file jd.txt --company "Sarvam AI" --role "ML Engineer"

# 7) after changing sources/scope, clear & re-pull
python -m job_copilot.cli reset
python -m job_copilot.cli refresh
```

Statuses: `new · saved · applied · screening · interview · offer · rejected · skipped`
Levels: `intern · new_grad · junior · mid · senior`

---

## Use it — Web app (the big UI)

```powershell
python -m uvicorn job_copilot.app:app --port 8000
# open http://127.0.0.1:8000
```

A full single-page app (served from `web/`, no build step, no CDN — works offline):

- **Overview** — KPI cards, match-score histogram, jobs-by-track donut, application
  funnel, top-companies bars, and a live "top matches" list.
- **Browse Jobs** — score ring per card, fuzzy search (press `/`), min-score slider,
  track/source/status filters, sort (match / newest / most-skills / company),
  pagination, and a slide-in detail drawer with the full description, matched skills,
  eligibility notes, and the recommended resume.
- **Pipeline** — a Kanban board; **drag cards** between saved → applied → screening →
  interview → offer → rejected to update status.
- **Tailor Resume** — paste a job's requirements/responsibilities (or hit "Tailor
  resume for this" inside any job), and it generates a **PDF (and .docx) tuned to that
  job**: picks the best base resume, sets the headline to the role, surfaces the JD's
  skills you already have, **semantically ranks your projects** against the JD (embed
  JD + each project → cosine), flags JD keywords you lack, and scores the **fit**
  (skills + experience) — **without inventing any experience**. Download the PDF.
  - Project ranking uses **neural embeddings** (`sentence-transformers`,
    all-MiniLM-L6-v2) when installed, else **TF-IDF cosine** (`embedding.py`).
  - PDF is rendered via MS Word/`docx2pdf`; if Word isn't present you still get the .docx.
- **Companies** — by-source / by-track bars and a company grid (click to filter jobs).
- **Profile** — your skills cloud, the scoring weights, eligibility rules, resume map.
- **↻ Refresh jobs** in the sidebar re-fetches every board live.

Front-end files live in `web/` (`index.html`, `styles.css`, `app.js`).

---

## How scoring works

`match score (0–100)` = weighted blend (`config.WEIGHTS`):

- **0.45 similarity** — cosine between your profile and the job. Uses **neural
  embeddings** (all-MiniLM-L6-v2) when `sentence-transformers` is installed:
  every in-scope job is batch-embedded and scored by its **max cosine over your
  strength-facets** (8 role summaries + 5 projects), so matching *any one* of your
  tracks scores high. Falls back to **TF-IDF cosine** automatically. (`embedding.py`)
- **0.35 skills** — how many of your ~90 skills appear in the posting.
- **0.20 title** — a target-title phrase (computer vision, fastapi, drone…) in the title/body.

Neural matching understands meaning, not just keywords — e.g. it correctly buries a
"Senior Accountant" role at a tech company while TF-IDF would over-score the shared
company/benefit words.

**Eligibility** (hard rules, on top of score) drops a job when:

- it demands more years than `max_required_years` (default **3**, parsed from "5+ years" etc.), or
- the title is **staff/principal/lead/manager/director+**.

`'senior'` is a soft `−12` penalty, not a hard block. Location is informational only
(remote / international are fine for you). Tune everything in `config.py` and `profile.py`.

---

## Files

```
job_copilot/
  profile.py     your profile + skills, pulled from ../build_resumes.py
  config.py      board list, location scope, scoring/eligibility knobs  <- edit to add companies
  sources.py     Greenhouse/Lever/Ashby/SmartRecruiters/Workday/Adzuna fetchers + South-India filter
  matcher.py     TF-IDF + skill-overlap scoring, track + level detection, resume pick
  tailor.py      JD-driven resume tailoring (reuses ../build_resumes.py)
  store.py       SQLite (copilot.db): jobs + application tracker
  app.py         FastAPI: dashboard + JSON API + tailor endpoints
  cli.py         terminal driver (refresh/top/show/track/tailor/reset/stats)
  web/           the SPA front-end (index.html, styles.css, app.js)
  tailored/      generated tailored resumes land here (.docx)
  copilot.db     created on first refresh
```

---

## Add more companies

Find one that uses Greenhouse / Lever / Ashby (the board URL gives away the token),
then add it to the matching list in `config.py`:

```python
GREENHOUSE_BOARDS = [ ("planetlabs", "Planet Labs"), ("yourco", "Your Co"), ... ]
```

Quick token check (open the company's careers page; the URL reveals the ATS):
- Greenhouse → `https://boards-api.greenhouse.io/v1/boards/<token>/jobs`
- Lever → `https://api.lever.co/v0/postings/<token>?mode=json`
- Ashby → `https://api.ashbyhq.com/posting-api/job-board/<token>`
- SmartRecruiters → `https://api.smartrecruiters.com/v1/companies/<id>/postings` → add to `SMARTRECRUITERS_BOARDS`
- Workday → URL looks like `<tenant>.<dc>.myworkdayjobs.com/<locale>/<site>` →
  add `("<tenant>","<dc>","<site>","Label")` to `WORKDAY_BOARDS`
  (e.g. `nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite`).

> Want CGI / L&T / a specific company added? Send me its careers-page URL — if it runs
> on any of the ATSes above it's a one-line add. (Big Indian IT like Infosys/TCS/Wipro
> often use Workday or in-house portals that block bots; those stay manual.)

## Optional: India coverage via Adzuna

Free key at <https://developer.adzuna.com/>, then:

```powershell
$env:ADZUNA_APP_ID="xxxx"; $env:ADZUNA_APP_KEY="yyyy"
python -m job_copilot.cli refresh
```

Edit `ADZUNA_QUERIES` in `config.py` for the searches you want.

## Optional: better matching with real embeddings

`pip install sentence-transformers`, then swap the TF-IDF block in `matcher.py`
for `bge-small-en-v1.5` embeddings (Phase-2 upgrade — TF-IDF is the zero-dependency
default and already ranks your niche roles to the top).
