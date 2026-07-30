import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import FilterChips from "./FilterChips.jsx";
import ProjectGrid from "./ProjectGrid.jsx";
import { FILTERS, projects } from "../../data/projects.js";
import "./work.css";

// Only needed after a card click — keep it (and its framer subtree) out of the
// initial bundle so the route paints sooner.
const CaseStudyModal = lazy(() => import("./CaseStudyModal.jsx"));

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const fromSlug = (s) => FILTERS.find((f) => slug(f) === s) || "All";

// Read a deep-link case id from the URL hash: #work?case=<id>
function caseFromHash() {
  if (typeof window === "undefined") return null;
  const m = window.location.hash.match(/case=([\w-]+)/);
  return m && projects.some((p) => p.id === m[1]) ? m[1] : null;
}

export default function Work() {
  // Initialize filter from URL hash (#work?f=computer-vision)
  const [filter, setFilter] = useState(() => {
    if (typeof window === "undefined") return "All";
    const m = window.location.hash.match(/f=([\w-]+)/);
    return m ? fromSlug(m[1]) : "All";
  });
  const [openId, setOpenId] = useState(null);
  // Mount the lazy modal on first open and keep it mounted so its
  // AnimatePresence exit animation still runs when the project is cleared.
  const [hasOpened, setHasOpened] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.categories.includes(filter)),
    [filter]
  );

  const changeFilter = (f) => {
    setFilter(f);
    const base = "#work";
    const next = f === "All" ? base : `${base}?f=${slug(f)}`;
    history.replaceState(null, "", next);
  };

  const openProject = (p) => {
    setHasOpened(true);
    setOpenId(p.id);
  };
  const closeModal = () => setOpenId(null);

  // Deep-link entry point. Showcase (and any other section) opens a case study
  // by dispatching window CustomEvent('open-case', { detail: id }) after
  // scrolling #work into view. Work stays the single modal owner.
  useEffect(() => {
    const openById = (id) => {
      if (!id || !projects.some((p) => p.id === id)) return;
      setHasOpened(true);
      setOpenId(id);
    };
    const onEvent = (e) => openById(e.detail);
    window.addEventListener("open-case", onEvent);
    // Also honor an initial #work?case=<id> hash on mount.
    openById(caseFromHash());
    return () => window.removeEventListener("open-case", onEvent);
  }, []);

  const activeProject = projects.find((p) => p.id === openId) || null;

  const cycle = (dir) => {
    if (!openId) return;
    const list = filtered.length ? filtered : projects;
    const idx = list.findIndex((p) => p.id === openId);
    if (idx === -1) return;
    const next = (idx + dir + list.length) % list.length;
    setOpenId(list[next].id);
  };

  return (
    <Section id="work">
      <SectionHeader
        index="01"
        title="Work"
        lead="Six case studies across computer vision, geospatial product engineering, and autonomous flight — including both sides of the Marut Survey Platform. Open a card for the full case study."
      />

      <FilterChips
        active={filter}
        onChange={changeFilter}
        shown={filtered.length}
        total={projects.length}
      />

      <ProjectGrid
        projects={filtered}
        total={projects.length}
        onOpen={openProject}
      />

      {hasOpened && (
        <Suspense fallback={null}>
          <CaseStudyModal
            project={activeProject}
            onClose={closeModal}
            onPrev={() => cycle(-1)}
            onNext={() => cycle(1)}
          />
        </Suspense>
      )}
    </Section>
  );
}
