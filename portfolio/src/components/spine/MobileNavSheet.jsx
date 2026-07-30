import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navSections, socials } from "../../data/profile.js";
import Icon from "../common/Icon.jsx";
import { EASE } from "../../lib/motion.js";
import "./spine.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNavSheet({ open, activeId, onClose }) {
  const sheetRef = useRef(null);
  const lastFocused = useRef(null);

  const handleNavigate = (e, id) => {
    e.preventDefault();
    onClose();
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }
    });
  };

  // Remember the trigger, restore focus to it on close.
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
    } else if (lastFocused.current instanceof HTMLElement) {
      lastFocused.current.focus();
    }
  }, [open]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Move focus into the sheet on open.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const first = sheet.querySelector(FOCUSABLE);
      (first || sheet).focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Escape to close + Tab focus trap.
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const sheet = sheetRef.current;
        if (!sheet) return;
        const nodes = sheet.querySelectorAll(FOCUSABLE);
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
    [onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sheet-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            id="mobile-nav-sheet"
            className="nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <svg
              className="nav-sheet__divider"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 6 L30 6 L30 2 L60 2 L60 10 L90 10 L90 6 L200 6"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
            </svg>
            <ul className="nav-sheet__list">
              {navSections.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.08, ease: EASE }}
                >
                  <a
                    href={`#${s.id}`}
                    className={`nav-sheet__link${
                      activeId === s.id ? " is-active" : ""
                    }`}
                    onClick={(e) => handleNavigate(e, s.id)}
                  >
                    <span className="mono">{s.index}</span>
                    <span>{s.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="nav-sheet__socials">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target={s.icon === "mail" ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  aria-label={s.label}
                >
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
