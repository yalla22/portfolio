import { useState } from "react";
import Reveal from "../common/Reveal.jsx";
import Icon from "../common/Icon.jsx";
import PlaceholderVisual from "./PlaceholderVisual.jsx";
import "./showcase.css";

// ShowcasePanel — one capability tile: lazy-loaded visual + annotated caption +
// a deep-link button into the matching case study.
//
// The real screenshot at `item.img` is lazy-loaded; if it is missing or errors
// we fall back to the themed inline SVG PlaceholderVisual (with a REPLACE badge
// so the owner knows which file to drop in).
//
// Deep-link: clicking "Open case study" updates the URL to #work?case=<id>,
// scrolls #work into view, and dispatches a window CustomEvent("open-case",
// { detail: projectId }). The Work section owns the modal and listens for it —
// this keeps Work the single modal owner with no cross-folder coupling.
//
// Props:
//   item   object  one entry from data/showcase.js
//                  { id, title, caption, visual, img, projectId }
//   index  number  position for the stagger-reveal delay + corner counter
//   align  "left" | "right"  alternating layout side (default "left")

function openCaseStudy(projectId) {
  if (!projectId || typeof window === "undefined") return;
  const hash = `#work?case=${projectId}`;
  history.replaceState(null, "", hash);
  const work = document.getElementById("work");
  if (work) work.scrollIntoView({ behavior: "smooth", block: "start" });
  window.dispatchEvent(new CustomEvent("open-case", { detail: projectId }));
}

export default function ShowcasePanel({ item, index = 0, align = "left" }) {
  const [errored, setErrored] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <Reveal
      as="li"
      delay={(index % 3) * 0.06}
      className={`showcase-panel showcase-panel--${align} lift`}
    >
      <div className="showcase-panel__media">
        {errored ? (
          <PlaceholderVisual visual={item.visual} replace={item.img} />
        ) : (
          <img
            className="showcase-panel__img"
            src={item.img}
            alt={item.title}
            loading="lazy"
            decoding="async"
            onError={() => setErrored(true)}
          />
        )}
        <span className="showcase-panel__index mono" aria-hidden="true">
          {num}
        </span>
      </div>

      <div className="showcase-panel__body">
        <h3 className="showcase-panel__title">{item.title}</h3>
        <p className="showcase-panel__caption">{item.caption}</p>
        {item.projectId && (
          <button
            type="button"
            className="showcase-panel__cta"
            onClick={() => openCaseStudy(item.projectId)}
            aria-label={`Open case study: ${item.title}`}
          >
            Open case study <Icon name="arrow-up-right" size={14} />
          </button>
        )}
      </div>
    </Reveal>
  );
}
