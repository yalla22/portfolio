import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";
import ProficiencyMeter from "./ProficiencyMeter.jsx";
import "./stack.css";

/**
 * Interactive skill card: domain label, animated proficiency meter, and a
 * wrap of skill pills. Hover lifts the card and sweeps an accent rule.
 *
 * Props:
 *   group {object} required — { id, label, proficiency, items: string[] }.
 *   index {number} optional — position used for staggered reveal + meter delay.
 */
export default function SkillCard({ group, index = 0 }) {
  const [ref, inView] = useInView();
  const reduced = useReducedMotion();
  const show = reduced || inView;

  return (
    <motion.article
      ref={ref}
      className="skill-card lift"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 16 }}
      transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : index * 0.06 }}
    >
      <header className="skill-card__head">
        <span className="mono-label skill-card__label">{group.label}</span>
        <span className="skill-card__pct mono-label" aria-hidden="true">
          {group.proficiency}%
        </span>
      </header>

      <ProficiencyMeter
        level={group.proficiency}
        label={`${group.label} proficiency`}
        delay={reduced ? 0 : index * 0.06 + 0.1}
      />

      <ul className="skill-card__items">
        {group.items.map((item) => (
          <li key={item} className="skill-card__item">
            {item}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
