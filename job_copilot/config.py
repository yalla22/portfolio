# -*- coding: utf-8 -*-
"""Sources to fetch jobs from, plus scoring/eligibility knobs.

SOURCES are public, ToS-clean ATS endpoints (no scraping, no anti-bot fight).
The company list is seeded with boards verified to return jobs and skewed
toward your fit: drone (Skydio), geospatial/EO (Planet Labs), robotics/CV
(Nuro, Verkada, Samsara), plus high-volume backend boards.

Add companies freely: find a company that uses Greenhouse/Lever/Ashby and drop
its board token in the right list. Tokens are usually the company slug.
"""

# --- job board sources (no API key required) --------------------------------
# Curated for SOUTH INDIA: companies that genuinely hire in Bengaluru / Hyderabad
# / Chennai etc. (verified to return South-India roles), plus a few niche
# drone/geo/CV boards kept for the rare India posting in your strongest field.
# NOTE: Greenhouse/Lever/Ashby have no server-side location filter, so we fetch
# each board then keep only South-India roles (see LOCATION filter below).
GREENHOUSE_BOARDS = [
    # token,            label,            base
    ("highradius",      "HighRadius"),     # Hyderabad
    ("phonepe",         "PhonePe"),        # Bengaluru
    ("zscaler",         "Zscaler"),        # Bengaluru
    ("hackerrank",      "HackerRank"),     # Bengaluru
    ("rubrik",          "Rubrik"),         # Bengaluru
    ("druva",           "Druva"),          # Pune / Bengaluru
    ("postman",         "Postman"),        # Bengaluru
    ("groww",           "Groww"),          # Bengaluru
    ("commvault",       "Commvault"),      # Hyderabad / Bengaluru
    ("workato",         "Workato"),        # Bengaluru
    ("twilio",          "Twilio"),         # Bengaluru
    ("mongodb",         "MongoDB"),        # Bengaluru / Gurgaon
    ("gitlab",          "GitLab"),         # remote (India)
    ("databricks",      "Databricks"),     # Bengaluru — data/ML platform
    ("samsara",         "Samsara"),        # Bengaluru — IoT/sensor backend
    ("stripe",          "Stripe"),         # Bengaluru — backend
    ("elastic",         "Elastic"),        # Bengaluru — search/data
    ("observeai",       "Observe.AI"),     # Bengaluru — speech/NLP AI
    # niche fit (drone / geospatial / CV) — usually US, kept for rare India roles
    ("planetlabs",      "Planet Labs"),    # geospatial / EO
    ("nuro",            "Nuro"),           # robotics / CV
    ("verkada",         "Verkada"),        # computer vision
]

LEVER_BOARDS = [
    ("mindtickle",      "Mindtickle"),     # Pune / Bengaluru
    ("shieldai",        "Shield AI"),      # niche drone fit
]

ASHBY_BOARDS = [
    ("sarvam",          "Sarvam AI"),      # Bengaluru — Indian AI/LLM lab (top ML fit)
    ("tekion",          "Tekion"),         # Bengaluru — cloud/automotive
    ("atlan",           "Atlan"),          # Bengaluru — data platform
    ("openai",          "OpenAI"),         # ML / research (has India roles)
    ("skydio",          "Skydio"),         # niche drone fit
]

# SmartRecruiters: many enterprise careers portals run on it (public API).
SMARTRECRUITERS_BOARDS = [
    ("Continental",     "Continental"),    # auto/embedded — Bengaluru, has interns
    ("Visa",            "Visa"),           # Bengaluru
]

# Workday: powers most big enterprise careers portals. We query each tenant by
# South-India city (searchText) so only relevant roles come back. To add one,
# open the company's careers page and read the URL:
#   https://<tenant>.<dc>.myworkdayjobs.com/<locale>/<site>
# e.g. nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite -> (nvidia, wd5, NVIDIAExternalCareerSite)
WORKDAY_BOARDS = [
    # (tenant, dc, site, label)
    ("nvidia",     "wd5",  "NVIDIAExternalCareerSite", "NVIDIA"),    # CV/CUDA/robotics — top fit
    ("salesforce", "wd12", "External_Career_Site",     "Salesforce"),
    ("adobe",      "wd5",  "external_experienced",     "Adobe"),
    ("ebay",       "wd5",  "apply",                    "eBay"),
    ("autodesk",   "wd1",  "Ext",                      "Autodesk"),
    ("target",     "wd5",  "targetcareers",            "Target"),    # Target India (Bengaluru)
]
WORKDAY_SEARCH_TERMS = ["Bengaluru", "Bangalore", "Hyderabad", "Chennai"]
WORKDAY_MAX_PER_TERM = 80  # cap postings pulled per city per company

# RemoteOK is global-remote (almost all non-India) -> off for a South-India scope.
ENABLE_REMOTEOK = False
REMOTEOK_TAGS = ["python", "machine-learning", "computer-vision", "backend"]

# Adzuna: the realistic way to get true Indian volume; fetches South cities
# server-side (where=). Free signup at https://developer.adzuna.com/ then:
#   set ADZUNA_APP_ID=...   set ADZUNA_APP_KEY=...
ADZUNA_COUNTRY = "in"
ADZUNA_QUERIES = [
    ("computer vision", "bangalore"),
    ("machine learning engineer", "hyderabad"),
    ("python fastapi", "bangalore"),
    ("backend developer", "chennai"),
    ("data engineer", "hyderabad"),
    ("software engineer", "coimbatore"),
    # early-career / internships
    ("software engineer intern", "bangalore"),
    ("machine learning intern", "hyderabad"),
    ("graduate engineer trainee", "chennai"),
]

# --- LOCATION scope: keep only South-India jobs -----------------------------
LOCATION_FILTER_ENABLED = True
# also keep India-wide / remote-India roles workable from the South (no other
# Indian metro named). Set False to require an explicit South-India city.
INCLUDE_INDIA_REMOTE = True

SOUTH_INDIA_KEYWORDS = [
    # Karnataka
    "bengaluru", "bangalore", "karnataka", "mysuru", "mysore", "mangaluru",
    "mangalore", "hubli", "hubballi", "belgaum", "belagavi", "udupi",
    # Telangana
    "hyderabad", "secunderabad", "telangana", "warangal",
    # Andhra Pradesh
    "andhra", "visakhapatnam", "vizag", "vijayawada", "amaravati", "guntur",
    "nellore", "tirupati", "kakinada",
    # Tamil Nadu
    "chennai", "madras", "tamil nadu", "tamilnadu", "coimbatore", "madurai",
    "tiruchirappalli", "trichy", "tirunelveli", "vellore", "hosur",
    # Kerala
    "kerala", "kochi", "cochin", "ernakulam", "trivandrum",
    "thiruvananthapuram", "kozhikode", "calicut", "thrissur", "kollam",
    # UT
    "puducherry", "pondicherry",
]

# If one of these (non-South Indian metro) is named, do NOT treat a generic
# "india" mention as in-scope.
NON_SOUTH_METROS = [
    "mumbai", "pune", "delhi", "new delhi", "gurgaon", "gurugram", "noida",
    "kolkata", "ahmedabad", "jaipur", "chandigarh", "indore", "nagpur",
    "lucknow", "bhubaneswar", "kanpur", "surat", "vadodara",
]

# --- scoring weights (must sum to ~1.0) -------------------------------------
WEIGHTS = {
    "similarity": 0.45,   # TF-IDF / embedding cosine, resume corpus vs job text
    "skills":     0.35,   # fraction of your skills present in the job
    "title":      0.20,   # target title phrase in the job title/body
}

# Minimum match score (0-100) for a job to count as "eligible" (alongside hard rules).
ELIGIBLE_MIN_SCORE = 35

# Penalty applied to score when a 'senior' soft-block word is in the title.
SENIOR_SOFT_PENALTY = 12

HTTP_TIMEOUT = 20
HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (JobCopilot; personal job-search assistant)",
    "Accept": "application/json",
}
