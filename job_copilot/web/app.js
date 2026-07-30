/* =====================================================================
   Job Copilot — front-end (vanilla JS, no framework, no CDN)
   ===================================================================== */
"use strict";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const api = async (path, opts) => {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error(path + " -> " + r.status);
  return r.json();
};
const esc = s => (s == null ? "" : String(s)).replace(/[&<>"']/g,
  c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

const PALETTE = ["#5b9dff","#7c6bff","#34d39e","#f5b945","#ff6b6b","#4fc3f7","#b794f6","#f78fb3"];
const STATUSES = ["new","saved","applied","screening","interview","offer","rejected","skipped"];
const PIPE_COLS = ["saved","applied","screening","interview","offer","rejected"];
const RESUME_LABEL = { drone:"Drone / Robotics", cv_ml:"ML / CV", backend:"Backend / Python",
  fullstack:"Full-Stack", devops:"Cloud / DevOps", swe:"Software Engineer" };
const LEVEL_LABEL = { intern:"🎓 Internship", new_grad:"🎓 New-grad", junior:"Junior",
  mid:"Mid", senior:"Senior" };
const STATUS_COLOR = { saved:"#f5b945", applied:"#5b9dff", screening:"#4fc3f7",
  interview:"#34d39e", offer:"#34d39e", rejected:"#ff6b6b", skipped:"#5f6f8e", new:"#8597b8" };

const state = {
  view: "overview",
  jobsById: {},
  filters: { min: 45, track:"", source:"", status:"", sort:"score", eligible:true, q:"", level:"", early:false },
  offset: 0, pageSize: 50, lastCount: 0,
  analytics: null, profile: null,
};

const scoreColor = s => s >= 65 ? "#34d39e" : s >= 50 ? "#f5b945" : "#ff6b6b";

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ===================================================================
   NAVIGATION
   =================================================================== */
function go(view) {
  state.view = view;
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $$(".view").forEach(v => v.classList.toggle("hidden", v.id !== "view-" + view));
  if (view === "overview")  renderOverview();
  if (view === "jobs")      { state.offset = 0; loadJobs(true); }
  if (view === "pipeline")  renderPipeline();
  if (view === "tailor")    renderTailor();
  if (view === "companies") renderCompanies();
  if (view === "profile")   renderProfile();
}

$$(".nav-item").forEach(b => b.onclick = () => go(b.dataset.view));
document.addEventListener("click", e => {
  const g = e.target.closest("[data-goto]");
  if (g) go(g.dataset.goto);
});

/* ===================================================================
   TOP BAR (kpis + search)
   =================================================================== */
function renderTopKpis(a) {
  const k = a.kpis;
  $("#topKpis").innerHTML = [
    ["jobs", k.jobs], ["eligible", k.eligible], ["avg match", k.avg_eligible_score],
    ["applied", k.applied], ["interviews", k.interview],
  ].map(([lab, v]) => `<div class="tk"><b>${v}</b><span>${lab}</span></div>`).join("");
  if (k.last_seen)
    $("#lastSeen").textContent = "updated " + new Date(k.last_seen).toLocaleString();
}

const searchEl = $("#globalSearch");
let searchT;
searchEl.addEventListener("input", () => {
  clearTimeout(searchT);
  searchT = setTimeout(() => {
    state.filters.q = searchEl.value.trim();
    if (state.view !== "jobs") go("jobs");
    else { state.offset = 0; loadJobs(true); }
  }, 250);
});
document.addEventListener("keydown", e => {
  if (e.key === "/" && document.activeElement !== searchEl) { e.preventDefault(); searchEl.focus(); }
  if (e.key === "Escape") closeDrawer();
});

/* ===================================================================
   OVERVIEW
   =================================================================== */
async function loadAnalytics() {
  state.analytics = await api("/api/analytics");
  renderTopKpis(state.analytics);
  return state.analytics;
}

async function renderOverview() {
  const a = state.analytics || await loadAnalytics();
  const k = a.kpis;

  // KPI cards
  $("#kpiGrid").innerHTML = [
    { ico:"🛰️", val:k.jobs, lab:"jobs fetched", sub:"public ATS APIs · no scraping" },
    { ico:"✅", val:k.eligible, lab:"eligible matches", sub:`avg ${k.avg_eligible_score}% match`, grad:true },
    { ico:"🎓", val:k.early_career ?? 0, lab:"early-career / intern" },
    { ico:"📨", val:k.applied, lab:"applied" },
    { ico:"🎯", val:k.interview, lab:"interviews", sub: k.offer ? `🏆 ${k.offer} offers` : "" },
    { ico:"📈", val:k.avg_score, lab:"avg score (all)" },
  ].map(c => `<div class="kpi ${c.grad?'grad':''}">
      <div class="k-ico">${c.ico}</div>
      <div class="k-val">${c.val}</div>
      <div class="k-lab">${c.lab}</div>
      ${c.sub ? `<div class="k-sub">${c.sub}</div>` : ""}
    </div>`).join("");

  renderScoreBars(a.score_buckets);
  renderTrackDonut(a.by_track);
  renderFunnel(a.pipeline);
  renderHBars("#companyBars", a.top_companies.slice(0, 8).map(c =>
    ({ lab:c.company, val:c.eligible, max:Math.max(1,...a.top_companies.map(x=>x.eligible)), sub:`${c.eligible}` })));

  // top matches
  const jobs = await api("/api/jobs?min_score=50&eligible_only=true&sort=score&limit=8");
  jobs.forEach(j => state.jobsById[j.id] = j);
  $("#topMatches").innerHTML = jobs.map(j => `
    <div class="mini" data-job="${esc(j.id)}">
      <div class="m-score" style="color:${scoreColor(j.score)}">${Math.round(j.score)}</div>
      <div class="m-t"><b>${esc(j.title)}</b><span>${esc(j.company)} · ${esc(j.location||"—")} · ${esc(j.track)}</span></div>
      <span class="chip track">${RESUME_LABEL[j.track]||j.track}</span>
    </div>`).join("") || `<div class="empty">No matches yet — hit “Refresh jobs”.</div>`;
  $$("#topMatches .mini").forEach(m => m.onclick = () => openDrawer(m.dataset.job));
}

function renderScoreBars(buckets) {
  const max = Math.max(1, ...buckets.map(b => b.count));
  $("#scoreBars").innerHTML = buckets.map(b => {
    const h = Math.round((b.count / max) * 100);
    const low = (+b.label) < 35;
    return `<div class="bar ${low?'low':''}">
      <div class="b-fill" style="height:${h}%" data-c="${b.count}"></div>
      <div class="b-x">${b.label}</div></div>`;
  }).join("");
}

function renderTrackDonut(tracks) {
  const total = tracks.reduce((s, t) => s + t.count, 0) || 1;
  let acc = 0; const segs = [];
  tracks.forEach((t, i) => {
    const col = PALETTE[i % PALETTE.length];
    const from = (acc / total) * 100, to = ((acc + t.count) / total) * 100;
    segs.push(`${col} ${from}% ${to}%`); acc += t.count;
  });
  const d = $("#trackDonut");
  d.style.background = `conic-gradient(${segs.join(",")})`;
  d.innerHTML = `<div class="d-center"><b style="font-size:22px;font-weight:780">${total}</b>
    <span style="font-size:10px;color:var(--mut)">jobs</span></div>`;
  $("#trackLegend").innerHTML = tracks.map((t, i) => `
    <div class="lg"><span class="dot" style="background:${PALETTE[i%PALETTE.length]}"></span>
      <span style="text-transform:capitalize">${t.track}</span>
      <span class="lg-n">${t.eligible}/${t.count}</span></div>`).join("");
}

function renderFunnel(pipe) {
  // include "eligible" pool as the top of the funnel
  const elig = state.analytics ? state.analytics.kpis.eligible : 0;
  const rows = [{ status:"eligible", count:elig }, ...pipe.filter(p =>
    ["saved","applied","interview","offer"].includes(p.status))];
  const max = Math.max(1, ...rows.map(r => r.count));
  $("#funnel").innerHTML = rows.map(r => {
    const w = Math.max(6, Math.round((r.count / max) * 100));
    const col = STATUS_COLOR[r.status] || "#5b9dff";
    return `<div class="fn"><div class="fn-lab">${r.status}</div>
      <div class="fn-bar" style="width:${w}%;background:${col}">${r.count}</div></div>`;
  }).join("");
}

function renderHBars(sel, rows) {
  const max = Math.max(1, ...rows.map(r => r.max ?? r.val));
  $(sel).innerHTML = rows.map(r => `
    <div class="hbar ${r.onClick?'click':''}" ${r.data?`data-x="${esc(r.data)}"`:""}>
      <span class="h-lab" title="${esc(r.lab)}">${esc(r.lab)}</span>
      <span class="h-track"><span class="h-fill" style="width:${Math.round((r.val/(r.max??max))*100)}%"></span></span>
      <span class="h-val">${r.sub ?? r.val}</span></div>`).join("");
}

/* ===================================================================
   JOBS
   =================================================================== */
const f = state.filters;
$("#minScore").addEventListener("input", e => {
  f.min = +e.target.value; $("#minScoreVal").textContent = f.min;
});
$("#minScore").addEventListener("change", () => { state.offset = 0; loadJobs(true); });
["fTrack","fSource","fStatus","fSort","fLevel"].forEach(id =>
  $("#" + id).addEventListener("change", e => {
    const map = { fTrack:"track", fSource:"source", fStatus:"status", fSort:"sort", fLevel:"level" };
    f[map[id]] = e.target.value; state.offset = 0; loadJobs(true);
  }));
$("#fEligible").addEventListener("change", e => { f.eligible = e.target.checked; state.offset = 0; loadJobs(true); });
$("#fEarly").addEventListener("change", e => { f.early = e.target.checked; state.offset = 0; loadJobs(true); });
$("#loadMore").addEventListener("click", () => { state.offset += state.pageSize; loadJobs(false); });

function jobsQuery() {
  const p = new URLSearchParams({
    min_score: f.min, sort: f.sort, eligible_only: f.eligible,
    limit: state.pageSize, offset: state.offset,
  });
  if (f.track) p.set("track", f.track);
  if (f.source) p.set("source", f.source);
  if (f.status) p.set("status", f.status);
  if (f.q) p.set("q", f.q);
  if (f.level) p.set("level", f.level);
  if (f.early) p.set("early_career", "true");
  return p.toString();
}

async function loadJobs(reset) {
  const list = $("#jobList");
  if (reset) list.innerHTML = `<div class="empty"><span class="spin"></span> loading…</div>`;
  const jobs = await api("/api/jobs?" + jobsQuery());
  jobs.forEach(j => state.jobsById[j.id] = j);
  state.lastCount = jobs.length;
  const html = jobs.map(jobCard).join("");
  if (reset) list.innerHTML = html || `<div class="empty">No jobs match these filters.</div>`;
  else list.insertAdjacentHTML("beforeend", html);
  $("#loadMore").classList.toggle("hidden", jobs.length < state.pageSize);
  $("#jobCount").textContent = reset ? `${jobs.length}${jobs.length>=state.pageSize?"+":""} jobs`
                                     : `${state.offset + jobs.length} jobs`;
  bindJobCards();
}

function jobCard(j) {
  const skills = (j.skill_hits || []).slice(0, 8)
    .map(s => `<span class="chip skill">${esc(s)}</span>`).join("");
  const reasons = (j.reasons || []).slice(0, 3)
    .map(r => `<span class="chip ${/needs|senior\/lead|location/.test(r)?'warn':''}">${esc(r)}</span>`).join("");
  const st = j.status || "new";
  return `<div class="jcard ${j.eligible?'':'inelig'}" data-job="${esc(j.id)}">
    <div class="ring" style="--p:${Math.min(100,j.score)};--rc:${scoreColor(j.score)}">
      <b style="color:${scoreColor(j.score)}">${Math.round(j.score)}</b><small>MATCH</small></div>
    <div class="j-main">
      <div class="j-title">${esc(j.title)}</div>
      <div class="j-meta">
        <span>${esc(j.company)}</span><span class="dot-sep">•</span>
        <span>${esc(j.location || "—")}</span>
        ${j.remote ? `<span class="dot-sep">•</span><span>🌐 remote</span>`:""}
        <span class="dot-sep">•</span><span class="chip track">${esc(j.track)}</span>
        ${j.level&&["intern","new_grad"].includes(j.level)?`<span class="chip early">${LEVEL_LABEL[j.level]}</span>`:""}
      </div>
      <div class="chips">${skills}${reasons}</div>
    </div>
    <div class="j-right">
      <span class="src-pill">${esc(j.source)}</span>
      <div class="rec">📄 <b>${RESUME_LABEL[j.track] || j.track}</b></div>
      <div class="statusrow">
        <span class="badge b-${st}">${st}</span>
        <select class="sel st-sel" data-job="${esc(j.id)}">
          ${STATUSES.map(s => `<option ${s===st?"selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <a class="applylink" href="${esc(j.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Apply ↗</a>
    </div></div>`;
}

function bindJobCards() {
  $$("#jobList .jcard").forEach(c => {
    c.onclick = e => { if (!e.target.closest("select,a")) openDrawer(c.dataset.job); };
  });
  $$("#jobList .st-sel").forEach(sel => {
    sel.onclick = e => e.stopPropagation();
    sel.onchange = async e => {
      await setStatus(sel.dataset.job, e.target.value);
      const badge = sel.parentElement.querySelector(".badge");
      badge.className = "badge b-" + e.target.value; badge.textContent = e.target.value;
    };
  });
}

async function setStatus(id, status) {
  await api(`/api/jobs/${encodeURIComponent(id)}/status`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (state.jobsById[id]) state.jobsById[id].status = status;
  toast(`Moved to “${status}”`);
  loadAnalytics();  // refresh top kpis silently
}

/* ===================================================================
   PIPELINE (kanban + drag & drop)
   =================================================================== */
async function renderPipeline() {
  const jobs = await api("/api/jobs?min_score=0&limit=1000&sort=recent");
  jobs.forEach(j => state.jobsById[j.id] = j);
  const touched = jobs.filter(j => j.status && j.status !== "new");
  const byCol = Object.fromEntries(PIPE_COLS.map(s => [s, []]));
  touched.forEach(j => { if (byCol[j.status]) byCol[j.status].push(j); });

  $("#kanban").innerHTML = PIPE_COLS.map(col => `
    <div class="kcol" data-col="${col}">
      <div class="kcol-head"><span style="color:${STATUS_COLOR[col]}">●</span> ${col}
        <span class="cnt">${byCol[col].length}</span></div>
      <div class="kcol-body">
        ${byCol[col].map(kCard).join("") || `<div class="kempty">drop here</div>`}
      </div>
    </div>`).join("");

  bindKanban();
}

function kCard(j) {
  return `<div class="kcard" draggable="true" data-job="${esc(j.id)}">
    <div class="kc-t">${esc(j.title)}</div>
    <div class="kc-m"><span class="kc-s">${Math.round(j.score)}%</span> · ${esc(j.company)} · ${esc(j.track)}</div>
  </div>`;
}

function bindKanban() {
  let dragId = null;
  $$(".kcard").forEach(card => {
    card.addEventListener("dragstart", () => { dragId = card.dataset.job; card.classList.add("dragging"); });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("click", () => openDrawer(card.dataset.job));
  });
  $$(".kcol").forEach(col => {
    col.addEventListener("dragover", e => { e.preventDefault(); col.classList.add("drop"); });
    col.addEventListener("dragleave", () => col.classList.remove("drop"));
    col.addEventListener("drop", async e => {
      e.preventDefault(); col.classList.remove("drop");
      if (!dragId) return;
      await setStatus(dragId, col.dataset.col);
      renderPipeline();
    });
  });
}

/* ===================================================================
   COMPANIES
   =================================================================== */
async function renderCompanies() {
  const a = state.analytics || await loadAnalytics();
  renderHBars("#sourceBars", a.by_source.map(s =>
    ({ lab:s.source, val:s.count, sub:`${s.count}` })));
  renderHBars("#trackBars", a.by_track.map(t =>
    ({ lab:t.track, val:t.count, sub:`${t.eligible}/${t.count}` })));

  $("#companyGrid").innerHTML = a.top_companies.map(c => `
    <div class="co" data-co="${esc(c.company)}">
      <div class="co-name">${esc(c.company)}</div>
      <div class="co-meta">avg match ${c.avg}%</div>
      <div class="co-stats">
        <div class="co-stat"><b>${c.count}</b><span>jobs</span></div>
        <div class="co-stat"><b style="color:var(--good)">${c.eligible}</b><span>eligible</span></div>
      </div></div>`).join("");
  $$("#companyGrid .co").forEach(co => co.onclick = () => {
    state.filters.q = co.dataset.co; searchEl.value = co.dataset.co;
    state.filters.eligible = false; $("#fEligible").checked = false;
    go("jobs");
  });
}

/* ===================================================================
   PROFILE
   =================================================================== */
async function renderProfile() {
  const p = state.profile || (state.profile = await api("/api/profile"));
  $("#profileCard").innerHTML = `
    <div class="card-head"><h3>${esc(p.name)}</h3><span class="hint">candidate</span></div>
    ${row("Email", p.email)}${row("Phone", p.phone)}
    ${row("Experience", `~${p.experience_years} yr (junior band)`)}
    ${row("Applies up to", `${p.max_required_years} yr roles`)}
    ${row("Home base", p.home_city)}
    ${row("Remote", p.remote_ok ? "yes" : "no")}
    ${row("International", p.open_to_international ? "open" : "no")}
    <div class="prof-row"><span class="pk">Locations OK</span>
      <span class="tags">${p.locations_ok.slice(0,8).map(l=>`<span class="chip">${esc(l)}</span>`).join("")}</span></div>`;

  const w = p.weights;
  $("#weightsBox").innerHTML = Object.entries(w).map(([k, v]) => `
    <div class="weight"><span class="w-lab">${k}</span>
      <span class="w-track"><span class="w-fill" style="width:${v*100}%"></span></span>
      <span class="w-val">${Math.round(v*100)}%</span></div>`).join("")
    + `<div class="prof-row" style="margin-top:8px"><span class="pk">Eligible if score ≥</span>
        <span class="pv">${p.eligible_min_score}%</span></div>`;

  $("#resumeMap").innerHTML = Object.entries(p.resumes).map(([t, file]) => `
    <div class="rm"><b>${RESUME_LABEL[t] || t}</b><span style="color:var(--mut)">${esc(file)}.docx</span></div>`).join("");

  const core = ["computer vision","machine learning","pytorch","fastapi","python","geospatial","drone","deep learning","opencv","celery"];
  $("#skillCount").textContent = p.skills.length + " skills";
  $("#skillCloud").innerHTML = p.skills.map(s =>
    `<span class="sk ${core.includes(s)?'core':''}">${esc(s)}</span>`).join("");
}
const row = (k, v) => `<div class="prof-row"><span class="pk">${esc(k)}</span><span class="pv">${esc(v)}</span></div>`;

/* ===================================================================
   TAILOR RESUME
   =================================================================== */
let _tailorInit = false;
async function renderTailor() {
  if (_tailorInit) return;
  _tailorInit = true;
  try {
    const roles = await api("/api/tailor/roles");
    const sel = $("#tBase");
    roles.forEach(r => sel.insertAdjacentHTML("beforeend",
      `<option value="${esc(r.key)}">${esc(r.label)}</option>`));
  } catch (e) {}
  $("#tGenerate").onclick = generateTailor;
  $("#tClear").onclick = () => {
    ["tCompany","tRole","tJd"].forEach(id => $("#"+id).value = "");
    $("#tBase").value = ""; $("#tResult").innerHTML =
      `<div class="empty">Paste a JD and hit <b>Generate</b>.</div>`;
  };
}

async function generateTailor() {
  const jd = $("#tJd").value.trim();
  const btn = $("#tGenerate");
  if (!jd) { $("#tMsg").textContent = "Paste the job requirements first."; return; }
  btn.disabled = true; btn.innerHTML = `<span class="spin"></span> generating…`;
  $("#tMsg").textContent = "";
  try {
    const r = await api("/api/tailor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jd_text: jd, company: $("#tCompany").value.trim(),
        role_title: $("#tRole").value.trim(), base_role: $("#tBase").value || null,
      }),
    });
    renderTailorResult(r);
    toast("Tailored resume ready ✓");
  } catch (e) {
    $("#tMsg").textContent = "⚠️ " + e.message;
  } finally {
    btn.disabled = false; btn.innerHTML = "⚙️ Generate tailored resume";
  }
}

function renderTailorResult(r) {
  const matched = (r.matched_skills || []).map(s => `<span class="chip skill">${esc(s)}</span>`).join("") || "—";
  const gaps = (r.gaps || []).map(s => `<span class="chip warn">${esc(s)}</span>`).join("")
    || `<span class="hint">none — you cover the JD's keywords 🎉</span>`;
  const projects = (r.ordered_projects || []).map((p, i) => {
    const title = (p && p.title != null) ? p.title : p;
    const sc = (p && p.score != null)
      ? `<span class="pj-score">${Math.round(p.score*100)}%</span>` : "";
    return `<div class="pj"><i>${i+1}</i> ${esc(title)} ${sc}</div>`;
  }).join("");
  const fitColor = { strong:"good", moderate:"warn", weak:"bad" }[r.fit] || "warn";
  const fitIcon = { strong:"✅", moderate:"🟡", weak:"⚠️" }[r.fit] || "🟡";
  $("#tResult").innerHTML = `
    <div class="t-res-top">
      <div class="t-pick">📄 Base resume: <b>${esc(r.base_role_label)}</b>
        <span class="hint">(track: ${esc(r.track)})</span></div>
      <span class="t-dl t-dlgroup">
        ${r.pdf_download_url
          ? `<a class="btn btn-grad" href="${esc(r.pdf_download_url)}">⬇ Download PDF</a>
             <a class="btn btn-ghost" href="${esc(r.download_url)}">.docx</a>`
          : `<a class="btn btn-grad" href="${esc(r.download_url)}">⬇ Download .docx</a>
             <span class="hint">PDF needs MS Word on the server</span>`}
      </span>
    </div>
    ${r.fit ? `<div class="fit-banner fit-${fitColor}">
      <b>${fitIcon} ${r.fit.toUpperCase()} FIT</b> · ${Math.round((r.coverage||0)*100)}% of JD keywords covered
      <div class="fit-note">${esc(r.fit_note||"")}</div></div>` : ""}
    <div class="t-cov">
      <div class="cov good"><b>${r.matched_count}</b><span>your skills the JD wants</span></div>
      <div class="cov ${r.gap_count?'warn':'good'}"><b>${r.gap_count||0}</b><span>JD keywords you lack</span></div>
      ${r.required_years!=null
        ? `<div class="cov ${r.experience_gap?'bad':'good'}"><b>${r.required_years}y vs ${r.your_years}y</b><span>experience: needs vs yours</span></div>`
        : `<div class="cov good"><b>${r.your_years}y</b><span>your experience</span></div>`}
    </div>
    <div class="t-block"><h4>✅ Skills surfaced (yours, matched to JD)</h4><div class="chips">${matched}</div></div>
    <div class="t-block"><h4>⚠️ Gaps — shown to you, never added to the resume</h4><div class="chips">${gaps}</div></div>
    <div class="t-block"><h4>📁 Projects — semantically ranked vs the JD
      <span class="hint" style="text-transform:none;letter-spacing:0">· ${esc(r.embed_backend||"")}</span></h4>
      <div class="t-proj">${projects}</div></div>
    <div class="t-block"><h4>📝 Summary used</h4><div class="dw-desc">${esc(r.summary)}</div></div>`;
}

function tailorForJob(id) {
  const j = state.jobsById[id]; if (!j) return;
  closeDrawer();
  go("tailor");
  $("#tCompany").value = j.company || "";
  $("#tRole").value = j.title || "";
  $("#tJd").value = (j.description && j.description.length > 40)
    ? j.description : `${j.title} at ${j.company}. ${(j.skill_hits||[]).join(", ")}`;
  $("#tBase").value = "";
  $("#tJd").scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ===================================================================
   DRAWER (job detail)
   =================================================================== */
function openDrawer(id) {
  const j = state.jobsById[id];
  if (!j) return;
  const st = j.status || "new";
  $("#drawerPanel").innerHTML = `
    <button class="dw-close" id="dwClose">✕</button>
    <div class="dw-title">${esc(j.title)}</div>
    <div class="dw-co">${esc(j.company)} · ${esc(j.location || "—")} ${j.remote?"· 🌐 remote":""}</div>
    <div class="dw-actions">
      <a class="btn btn-grad" href="${esc(j.url)}" target="_blank" rel="noopener">Apply on site ↗</a>
      <button class="btn" id="dwTailor">✏️ Tailor resume for this</button>
      <select class="sel" id="dwStatus">${STATUSES.map(s=>`<option ${s===st?"selected":""}>${s}</option>`).join("")}</select>
    </div>
    <div class="dw-section"><div class="dw-grid">
      <div class="dw-kv"><div class="k">Match score</div><div class="v" style="color:${scoreColor(j.score)}">${Math.round(j.score)}%</div></div>
      <div class="dw-kv"><div class="k">Eligible</div><div class="v">${j.eligible?"✅ yes":"⚠️ no"}</div></div>
      <div class="dw-kv"><div class="k">Track / resume</div><div class="v">${RESUME_LABEL[j.track]||j.track}</div></div>
      <div class="dw-kv"><div class="k">Level</div><div class="v">${LEVEL_LABEL[j.level]||j.level||"—"}</div></div>
      <div class="dw-kv"><div class="k">Skills matched</div><div class="v">${j.skill_hit_count}</div></div>
      <div class="dw-kv"><div class="k">Req. experience</div><div class="v">${j.required_years!=null?j.required_years+"+ yr":"unstated"}</div></div>
      <div class="dw-kv"><div class="k">Source</div><div class="v">${esc(j.source)}</div></div>
    </div></div>
    <div class="dw-section"><h4>Matched skills</h4>
      <div class="chips">${(j.skill_hits||[]).map(s=>`<span class="chip skill">${esc(s)}</span>`).join("") || "<span class='hint'>—</span>"}</div></div>
    ${j.reasons&&j.reasons.length?`<div class="dw-section"><h4>Eligibility notes</h4>
      <div class="chips">${j.reasons.map(r=>`<span class="chip warn">${esc(r)}</span>`).join("")}</div></div>`:""}
    <div class="dw-section"><h4>Recommended resume</h4>
      <div class="dw-kv"><div class="v" style="color:#bfe0ff">${esc(state.profile?.resumes?.[j.track]||"")}.docx</div></div></div>
    <div class="dw-section"><h4>Job description</h4>
      <div class="dw-desc">${esc((j.description||"").slice(0, 6000)) || "No description provided."}</div></div>`;
  $("#drawer").classList.remove("hidden");
  $("#dwClose").onclick = closeDrawer;
  $("#drawerBackdrop").onclick = closeDrawer;
  $("#dwTailor").onclick = () => tailorForJob(id);
  $("#dwStatus").onchange = async e => {
    await setStatus(id, e.target.value);
    if (state.view === "jobs") loadJobs(true);
    if (state.view === "pipeline") renderPipeline();
  };
}
function closeDrawer() { $("#drawer").classList.add("hidden"); }

/* ===================================================================
   REFRESH + BOOT
   =================================================================== */
$("#refreshBtn").onclick = async e => {
  const b = e.currentTarget; b.disabled = true;
  b.innerHTML = `<span class="spin"></span> fetching…`;
  $("#refreshMsg").textContent = "hitting public job boards…";
  try {
    const r = await api("/api/refresh", { method: "POST" });
    $("#refreshMsg").textContent = `✓ ${r.new} new · ${r.updated} updated · ${r.fetched} fetched`;
    state.profile = null;
    await loadAnalytics();
    go(state.view);
  } catch (err) {
    $("#refreshMsg").textContent = "⚠️ " + err.message;
  } finally {
    b.disabled = false; b.innerHTML = "↻ Refresh jobs";
  }
};

(async function boot() {
  try {
    state.profile = await api("/api/profile");
    await loadAnalytics();
  } catch (e) { /* empty db before first refresh */ }
  go("overview");
})();
