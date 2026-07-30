import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useCountUp } from "../../lib/useCountUp.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";
import Icon from "../common/Icon.jsx";
import { heroStats } from "../../data/profile.js";

/**
 * HeroStats — 4 animated stat tiles in the hero right rail.
 * Folds in the deleted Snapshot section.
 *
 * Data: profile.heroStats. Tile with `count:true` count-ups its numeric value
 * (useCountUp); label-only tiles render an icon kicker + caption. Icons that
 * are not present in Icon.jsx render nothing (Icon returns null) — safe.
 *
 * Props: none. Self-contained; observes its own viewport entry.
 */
function StatTile({ stat, index }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const reduced = useReducedMotion();
  const show = reduced || inView;

  const counted = useCountUp(
    typeof stat.value === "number" ? stat.value : 0,
    inView && stat.count,
    { decimals: stat.decimals ?? 0 }
  );

  return (
    <motion.div
      ref={ref}
      className={`hero-stat${stat.count ? " hero-stat--lead" : ""}`}
      role="listitem"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 14 }}
      transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : index * 0.07 }}
    >
      {stat.count ? (
        <span className="hero-stat__value">
          {counted}
          {stat.suffix}
        </span>
      ) : (
        stat.icon && (
          <span className="hero-stat__icon" aria-hidden="true">
            <Icon name={stat.icon} size={20} />
          </span>
        )
      )}
      <span className="mono-label hero-stat__label">{stat.label}</span>
    </motion.div>
  );
}

export default function HeroStats() {
  return (
    <div className="hero-stats" role="list" aria-label="Key facts">
      {heroStats.map((stat, i) => (
        <StatTile key={stat.id} stat={stat} index={i} />
      ))}
    </div>
  );
}
