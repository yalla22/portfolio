import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { useCountUp } from "../../lib/useCountUp.js";
import { EASE } from "../../lib/motion.js";
import "./stack.css";

/**
 * Animated proficiency bar that reveals on scroll.
 *
 * Props:
 *   level  {number}  required — 0–100 proficiency value.
 *   label  {string}  optional — accessible label (defaults to "Proficiency").
 *   delay  {number}  optional — animation delay in seconds (for stagger).
 *
 * Accessibility: exposes role="meter" with aria-valuenow/min/max.
 * Reduced motion: fills instantly and skips the count-up.
 */
export default function ProficiencyMeter({ level = 0, label = "Proficiency", delay = 0 }) {
  const clamped = Math.max(0, Math.min(100, level));
  const [ref, inView] = useInView({ threshold: 0.4 });
  const reduced = useReducedMotion();
  const show = reduced || inView;
  const display = useCountUp(clamped, show, { duration: 1100, decimals: 0 });

  return (
    <div
      className="proficiency"
      ref={ref}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${clamped} out of 100`}
    >
      <div className="proficiency__track">
        <motion.div
          className="proficiency__fill"
          initial={false}
          animate={{ scaleX: show ? clamped / 100 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.9, ease: EASE, delay }
          }
        />
      </div>
      <span className="proficiency__value mono-label" aria-hidden="true">
        {display}
      </span>
    </div>
  );
}
