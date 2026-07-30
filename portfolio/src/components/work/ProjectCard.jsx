import { motion } from "framer-motion";
import { cardVariants } from "../../lib/motion.js";
import MetricStrip from "./MetricStrip.jsx";
import TechTags from "./TechTags.jsx";
import PlaceholderVisual from "./PlaceholderVisual.jsx";
import Icon from "../common/Icon.jsx";
import "./work.css";

// Pick the cover-visual kind for a card: prefer the first gallery item's
// placeholder key, else fall back to a category-derived default.
function coverKind(project) {
  if (project.gallery && project.gallery[0]?.placeholder) {
    return project.gallery[0].placeholder;
  }
  if (project.categories.includes("Robotics")) return "precland";
  if (project.categories.includes("Geospatial")) return "ortho";
  return "drone";
}

export default function ProjectCard({ project, index, total, onOpen }) {
  const num = String(index + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");
  const cover = project.gallery && project.gallery[0];
  const kind = coverKind(project);

  return (
    <motion.li layout variants={cardVariants} exit="exit" className="project-card-wrap">
      <button
        type="button"
        className="project-card"
        onClick={() => onOpen(project)}
        aria-haspopup="dialog"
        aria-label={`Open case study: ${project.title}`}
      >
        <span className="project-card__rule" aria-hidden="true" />

        {/* Visual banner — turns the card from a text block into visual proof. */}
        <div className="project-card__banner">
          {cover?.src ? (
            <img
              className="project-card__img"
              src={cover.src}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // Hide the broken <img>; the SVG placeholder underneath shows.
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <PlaceholderVisual kind={kind} showBadge={false} />

          <span className="project-card__status" aria-hidden="true">
            <span className="project-card__dot" />
            <span className="mono">{project.status}</span>
          </span>

          <div className="project-card__banner-cats">
            {project.categories.map((c) => (
              <span key={c} className="mono project-card__cat">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="project-card__body">
          <div className="project-card__top">
            <span className="mono project-card__index">
              {num} / {totalStr}
            </span>
            <span className="mono project-card__kicker">CASE STUDY</span>
          </div>

          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__summary">{project.summary}</p>

          <MetricStrip metrics={project.metrics} />

          <div className="project-card__foot">
            <TechTags tech={project.tech} max={5} />
            <span className="project-card__view">
              Open case study <Icon name="arrow-up-right" size={14} />
            </span>
          </div>
        </div>
      </button>
    </motion.li>
  );
}
