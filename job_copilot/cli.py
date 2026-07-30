# -*- coding: utf-8 -*-
"""Command-line driver for the Job Copilot.

Usage (run from the DISC_14 folder):
  python -m job_copilot.cli refresh
  python -m job_copilot.cli top --min 50 --track cv_ml
  python -m job_copilot.cli top --min 45 --eligible
  python -m job_copilot.cli track "as:skydio:123" applied --resume ML_CV_Engineer
  python -m job_copilot.cli stats
"""
from __future__ import annotations
import argparse
import sys

from . import sources, matcher, store


def _trunc(s: str, n: int) -> str:
    s = (s or "").replace("\n", " ")
    return s if len(s) <= n else s[: n - 1] + "…"


def cmd_refresh(_args):
    print("Fetching public ATS boards (no scraping)…")
    raw, _log = sources.fetch_all(verbose=True)
    print(f"\nScoring {len(raw)} jobs against your profile  [{matcher.backend_label()}]…")
    scored = matcher.score_all(raw)
    res = store.upsert_jobs(scored)
    print(f"Done. {res['new']} new, {res['updated']} updated.")
    _print_stats()


def cmd_top(args):
    jobs = store.query_jobs(min_score=args.min, source=args.source,
                            track=args.track, eligible_only=args.eligible,
                            status=args.status, limit=args.limit)
    if not jobs:
        print("No jobs match. Run `refresh` first, or lower --min.")
        return
    print(f"\n{'SCORE':>5}  {'SK':>2}  {'TRACK':<9} {'COMPANY':<16} {'TITLE':<42} {'LOCATION':<18} STATUS")
    print("-" * 118)
    for j in jobs:
        print(f"{j['score']:>5.0f}  {j['skill_hit_count']:>2}  {j['track']:<9} "
              f"{_trunc(j['company'],16):<16} {_trunc(j['title'],42):<42} "
              f"{_trunc(j['location'],18):<18} {j.get('status','new')}")
    print(f"\n{len(jobs)} jobs shown.  Use the URL to apply; pick the recommended resume.")
    print("Tip: `python -m job_copilot.cli show \"<id>\"` for full detail.")


def cmd_show(args):
    j = store.get_job(args.id)
    if not j:
        print("Job id not found."); return
    print(f"\n{j['title']}  @  {j['company']}")
    print(f"score={j['score']}  eligible={j['eligible']}  track={j['track']}  "
          f"required_years={j['required_years']}")
    print(f"location={j['location']}  remote={j['remote']}  source={j['source']}")
    print(f"recommended resume: {j['recommended_resume']}")
    print(f"url: {j['url']}")
    print(f"matched skills: {', '.join(j['skill_hits'])}")
    print(f"reasons: {', '.join(j['reasons'])}")
    print(f"status: {j.get('status')}  notes: {j.get('notes') or '-'}")
    print("\n--- description (first 1200 chars) ---")
    print(_trunc(j['description'], 1200))


def cmd_track(args):
    res = store.update_status(args.id, status=args.status,
                              resume_version=args.resume, notes=args.notes,
                              contact=args.contact, follow_up_at=args.follow_up)
    print(f"Updated {res['job_id']} -> status={res['status']}")


def cmd_tailor(args):
    from . import tailor as tlr
    jd = ""
    company, role = args.company or "", args.role or ""
    if args.job:
        j = store.get_job(args.job)
        if not j:
            print("Job id not found."); return
        jd = j.get("description") or j.get("title") or ""
        company = company or j.get("company") or ""
        role = role or j.get("title") or ""
    elif args.file:
        with open(args.file, encoding="utf-8") as fh:
            jd = fh.read()
    else:
        print("Provide --job <id> or --file <jd.txt>."); return
    res = tlr.tailor(jd, company=company, role_title=role, base_role=args.base)
    print(f"\nBase resume : {res['base_role_label']}  (track {res['track']})")
    print(f"FIT: {res['fit'].upper()}  ({int(res['coverage']*100)}% of JD keywords covered) — {res['fit_note']}")
    print(f"Matched {res['matched_count']} of your skills the JD wants:")
    print("  " + ", ".join(res["matched_skills"]))
    print(f"Gaps ({res['gap_count']}, JD wants, you lack): {', '.join(res['gaps']) or 'none'}")
    print(f"Project ranking ({res.get('embed_backend','')}):")
    for p in res["ordered_projects"]:
        title = p["title"] if isinstance(p, dict) else p
        sc = f"  [{int(p['score']*100)}%]" if isinstance(p, dict) else ""
        print(f"  -{sc} {title}")
    print(f"\nSaved DOCX -> {res['path']}")
    if res.get("pdf_path"):
        print(f"Saved PDF  -> {res['pdf_path']}")
    else:
        print("PDF: not generated (needs MS Word / docx2pdf)")


def cmd_reset(args):
    res = store.reset_jobs(keep_tracked=not args.all)
    print(f"Removed {res['removed']} jobs "
          f"({'kept tracked/pipeline' if res['kept_tracked'] else 'wiped everything'}).")
    print("Run `refresh` to repopulate with the current location scope.")


def cmd_stats(_args):
    _print_stats()


def _print_stats():
    s = store.stats()
    print(f"\nDB: {s['jobs']} jobs ({s['eligible']} eligible)")
    print("By status: " + "  ".join(f"{k}={v}" for k, v in s["by_status"].items() if v))


def main(argv=None):
    # Windows consoles default to cp1252; make sure unicode in output never crashes.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    p = argparse.ArgumentParser(prog="job_copilot", description="AI Job Copilot")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("refresh", help="fetch + score + store jobs").set_defaults(fn=cmd_refresh)

    t = sub.add_parser("top", help="show ranked jobs")
    t.add_argument("--min", type=float, default=45)
    t.add_argument("--track", default=None)
    t.add_argument("--source", default=None)
    t.add_argument("--status", default=None)
    t.add_argument("--eligible", action="store_true")
    t.add_argument("--limit", type=int, default=40)
    t.set_defaults(fn=cmd_top)

    sh = sub.add_parser("show", help="show one job in full")
    sh.add_argument("id")
    sh.set_defaults(fn=cmd_show)

    tr = sub.add_parser("track", help="update application status")
    tr.add_argument("id")
    tr.add_argument("status", help="new|saved|applied|screening|interview|offer|rejected|skipped")
    tr.add_argument("--resume", default=None)
    tr.add_argument("--notes", default=None)
    tr.add_argument("--contact", default=None)
    tr.add_argument("--follow-up", default=None)
    tr.set_defaults(fn=cmd_track)

    tl = sub.add_parser("tailor", help="generate a JD-tailored resume .docx")
    tl.add_argument("--job", help="tailor from a stored job id")
    tl.add_argument("--file", help="tailor from a JD text file")
    tl.add_argument("--company", default=None)
    tl.add_argument("--role", default=None, help="role title for the headline")
    tl.add_argument("--base", default=None, help="force a base resume role key")
    tl.set_defaults(fn=cmd_tailor)

    rs = sub.add_parser("reset", help="clear stored jobs (after changing scope/sources)")
    rs.add_argument("--all", action="store_true", help="also wipe tracked/pipeline jobs")
    rs.set_defaults(fn=cmd_reset)

    sub.add_parser("stats", help="show counts").set_defaults(fn=cmd_stats)

    args = p.parse_args(argv)
    args.fn(args)


if __name__ == "__main__":
    main(sys.argv[1:])
