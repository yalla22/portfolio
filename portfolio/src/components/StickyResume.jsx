import { useEffect, useState } from "react";
import { profile } from "../data/profile.js";
import Icon from "./common/Icon.jsx";
import "./sticky-resume.css";

// StickyResume — a floating "Download Résumé" CTA that appears once the user
// scrolls past the hero and hides again near the very bottom (where the
// Contact section already surfaces the résumé button, avoiding duplication).
//
// Bottom-right on desktop, bottom-center pill on mobile. Reduced-motion safe:
// it simply toggles visibility with a short opacity/transform transition that
// CSS disables under prefers-reduced-motion.
export default function StickyResume() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const past = y > window.innerHeight * 0.85;
      const doc = document.documentElement;
      const nearBottom =
        y + window.innerHeight >= doc.scrollHeight - window.innerHeight * 0.6;
      setVisible(past && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <a
      className={`sticky-resume${visible ? " is-visible" : ""}`}
      href={profile.resume}
      target="_blank"
      rel="noreferrer noopener"
      aria-hidden={visible ? undefined : "true"}
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="download" size={16} />
      <span className="sticky-resume__label">Résumé</span>
    </a>
  );
}
