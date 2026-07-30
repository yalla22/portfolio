import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { modalVariants } from "../../lib/motion.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import Tag from "../common/Tag.jsx";
import Icon from "../common/Icon.jsx";
import CaseStudyGallery from "./CaseStudyGallery.jsx";
import "./work.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Derive a clean "github.com/handle" label from a repo URL.
function repoLabel(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/|\/$/g, "");
    return path ? `${u.host}/${path}` : u.host;
  } catch {
    return "Source";
  }
}

// CaseStudyModal — full case-study dialog for a project.
//
// Keeps every accessibility guarantee from the original ProjectModal: portal,
// focus trap, ESC to close, ←/→ to cycle, body scroll-lock, AnimatePresence
// enter/exit, and reduced-motion fallbacks. Body is restructured into labelled
// case-study sections: Problem → Solution → Impact → Architecture → Gallery →
// Stack → links.
//
// Props:
//   project: project record | null   (null closes the dialog)
//   onClose:  () => void
//   onPrev:   () => void             (cycle to previous project)
//   onNext:   () => void             (cycle to next project)
export default function CaseStudyModal({ project, onClose, onPrev, onNext }) {
  const reduced = useReducedMotion();
  const panelRef = useRef(null);
  const lastFocused = useRef(null);
  const open = !!project;

  useEffect(() => {
    if (open) lastFocused.current = document.activeElement;
  }, [open]);

  // Scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management: focus panel on open, restore on close.
  // Depends on `open` only — cycling projects must not yank focus back to Close.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (panel) {
          const closeBtn = panel.querySelector("[data-modal-close]");
          (closeBtn || panel).focus();
        }
      });
      return () => cancelAnimationFrame(id);
    }
    if (lastFocused.current instanceof HTMLElement) {
      lastFocused.current.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const nodes = panel.querySelectorAll(FOCUSABLE);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, onPrev, onNext]
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={onClose}
        >
          <motion.div
            ref={panelRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            variants={reduced ? undefined : modalVariants}
            initial={reduced ? false : "hidden"}
            animate={reduced ? { opacity: 1 } : "show"}
            exit={reduced ? { opacity: 0 } : "exit"}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="modal__bar">
              <span className="mono modal__brief">CASE STUDY</span>
              <div className="modal__nav">
                <button
                  type="button"
                  className="modal__navbtn"
                  onClick={onPrev}
                  aria-label="Previous project"
                >
                  <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} />
                </button>
                <button
                  type="button"
                  className="modal__navbtn"
                  onClick={onNext}
                  aria-label="Next project"
                >
                  <Icon name="arrow" size={16} />
                </button>
                <button
                  type="button"
                  className="modal__close"
                  onClick={onClose}
                  aria-label="Close case study"
                  data-modal-close
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </div>

            <div className="modal__body">
              <div className="modal__cats">
                {project.categories.map((c) => (
                  <span key={c} className="mono modal__cat">
                    {c}
                  </span>
                ))}
              </div>

              {/* Announce project change to screen readers when cycling. */}
              <p className="visually-hidden" aria-live="polite">
                {project.title}
              </p>

              <h2 id="modal-title" className="modal__title">
                {project.title}
              </h2>
              <p className="modal__overview">{project.overview}</p>

              {/* PROBLEM */}
              {project.problem && (
                <section className="modal__section">
                  <h3 className="modal__subhead mono">PROBLEM</h3>
                  <p className="modal__prose">{project.problem}</p>
                </section>
              )}

              {/* SOLUTION */}
              {project.solution && (
                <section className="modal__section">
                  <h3 className="modal__subhead mono">SOLUTION</h3>
                  <p className="modal__prose">{project.solution}</p>
                </section>
              )}

              {/* IMPACT */}
              {project.impact?.length > 0 && (
                <section className="modal__section">
                  <h3 className="modal__subhead mono">IMPACT</h3>
                  <ul className="metric-strip modal__impact" aria-label="Impact highlights">
                    {project.impact.map((m, i) => (
                      <li key={i} className="metric-strip__item">
                        {m}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ARCHITECTURE — numbered stepped flow */}
              {project.architecture?.length > 0 && (
                <section className="modal__section">
                  <h3 className="modal__subhead mono">ARCHITECTURE</h3>
                  <ol className="modal__arch">
                    {project.architecture.map((step, i) => (
                      <li key={i} className="modal__arch-step">
                        <span className="mono modal__arch-num">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {i > 0 && (
                          <span className="modal__arch-arrow" aria-hidden="true">
                            <Icon name="arrow" size={14} style={{ transform: "rotate(90deg)" }} />
                          </span>
                        )}
                        <span className="modal__arch-text">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* GALLERY */}
              {project.gallery?.length > 0 && (
                <section className="modal__section">
                  <h3 className="modal__subhead mono">SCREENSHOTS</h3>
                  <CaseStudyGallery gallery={project.gallery} />
                </section>
              )}

              {/* STACK */}
              <section className="modal__section">
                <h3 className="modal__subhead mono">TECHNOLOGIES</h3>
                <div className="modal__tags">
                  {project.tech.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </section>

              {/* LINKS */}
              <div className="modal__links">
                {project.repo ? (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="modal__link"
                  >
                    <Icon name="github" size={16} /> {repoLabel(project.repo)}
                    <Icon name="arrow-up-right" size={14} />
                  </a>
                ) : (
                  <span className="modal__link modal__link--muted">
                    <Icon name="github" size={16} />
                    {project.internal
                      ? "Internal — repository private"
                      : "Repository link coming soon"}
                  </span>
                )}
                {project.demo || project.live ? (
                  <a
                    href={project.demo || project.live}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="modal__link"
                  >
                    <Icon name="arrow-up-right" size={14} /> Live demo
                  </a>
                ) : (
                  <span className="modal__link modal__link--muted">Demo coming soon</span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
