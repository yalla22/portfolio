import { memo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";

// Lawn-mower boustrophedon survey grid path over the contour field.
// viewBox 0 0 1000 600. The drone node rides it via CSS offset-path.
const SURVEY_PATH =
  "M 90 110 L 910 110 L 910 200 L 90 200 L 90 290 L 910 290 L 910 380 L 90 380 L 90 470 L 910 470";

// Waypoints at each turn of the survey pattern.
const WAYPOINTS = [
  [90, 110],
  [910, 110],
  [910, 200],
  [90, 200],
  [90, 290],
  [910, 290],
  [910, 380],
  [90, 380],
  [90, 470],
  [910, 470],
];

function FlightPathTrace({ active }) {
  const reduced = useReducedMotion();
  const running = active && !reduced;

  return (
    <svg
      className="flight-path"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* The survey path — self-draws */}
      <motion.path
        d={SURVEY_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: running ? 1 : reduced ? 1 : 0 }}
        transition={{ duration: 2, ease: EASE }}
        style={{ opacity: 0.9 }}
      />

      {/* Waypoint dots pop in staggered */}
      {WAYPOINTS.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3.5"
          fill="var(--accent)"
          initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          animate={{
            scale: running || reduced ? 1 : 0,
            opacity: running || reduced ? 1 : 0,
          }}
          transition={{
            delay: reduced ? 0 : 0.2 + i * 0.18,
            type: "spring",
            stiffness: 400,
            damping: 18,
          }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}

      {/* Drone node riding the path via offset-path */}
      <g
        className={`drone-node${running ? " is-flying" : " is-parked"}`}
        style={{
          offsetPath: `path('${SURVEY_PATH}')`,
          // park at the end under reduced motion
          offsetDistance: reduced ? "100%" : undefined,
        }}
      >
        <circle className="drone-node__ring" r="11" />
        <circle className="drone-node__core" r="5" fill="var(--accent)" />
      </g>
    </svg>
  );
}

export default memo(FlightPathTrace);
