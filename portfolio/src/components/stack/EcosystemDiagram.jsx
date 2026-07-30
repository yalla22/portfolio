import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";
import "./stack.css";

/**
 * Responsive hub-and-spoke technology-ecosystem diagram (SVG).
 *
 * A central hub ("Drone & Geospatial AI") connects to N domain nodes laid out
 * on a circle. Faint connectors draw in on scroll; domain chips list their
 * tools. The SVG uses a fixed viewBox + preserveAspectRatio so it scales from
 * ~320px to 2560px with no horizontal overflow. Below the diagram a stacked
 * legend (pure CSS, shown on narrow screens) carries the same content.
 *
 * Props:
 *   data {object} required — { center: string, nodes: [{ id, label, items[] }] }.
 *
 * Accessibility: the SVG is aria-hidden (decorative); a visually-hidden text
 * summary + the visible legend provide the equivalent information.
 * Reduced motion: connectors/nodes render in place with no draw/pulse.
 */
export default function EcosystemDiagram({ data }) {
  const [ref, inView] = useInView({ threshold: 0.25 });
  const reduced = useReducedMotion();
  const show = reduced || inView;

  if (!data?.nodes?.length) return null;

  // viewBox geometry (square-ish canvas, centered hub).
  const W = 600;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2;
  const rx = 210; // horizontal spoke radius
  const ry = 150; // vertical spoke radius
  const n = data.nodes.length;

  const placed = data.nodes.map((node, i) => {
    // Start at top, distribute evenly around the ellipse.
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      ...node,
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });

  return (
    <div className="ecosystem" ref={ref}>
      <p className="visually-hidden">
        {data.center} ecosystem connecting:{" "}
        {data.nodes
          .map((node) => `${node.label} (${node.items.join(", ")})`)
          .join("; ")}
        .
      </p>

      <svg
        className="ecosystem__svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        {/* Connectors */}
        <g className="ecosystem__links">
          {placed.map((node, i) => (
            <motion.line
              key={node.id}
              x1={cx}
              y1={cy}
              x2={node.x}
              y2={node.y}
              className="ecosystem__link"
              initial={false}
              animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.55, ease: EASE, delay: 0.1 + i * 0.08 }
              }
            />
          ))}
        </g>

        {/* Domain nodes */}
        {placed.map((node, i) => (
          <motion.g
            key={node.id}
            className="ecosystem__node"
            initial={false}
            animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.85 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.45, ease: EASE, delay: 0.3 + i * 0.08 }
            }
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            <circle cx={node.x} cy={node.y} r={50} className="ecosystem__node-bg" />
            <text x={node.x} y={node.y} className="ecosystem__node-label">
              {node.label}
            </text>
          </motion.g>
        ))}

        {/* Center hub (drawn last so it sits on top) */}
        <motion.g
          className="ecosystem__hub"
          initial={false}
          animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={66} className="ecosystem__hub-bg" />
          <text x={cx} y={cy - 8} className="ecosystem__hub-label">
            Drone &amp;
          </text>
          <text x={cx} y={cy + 10} className="ecosystem__hub-label">
            Geospatial
          </text>
          <text x={cx} y={cy + 28} className="ecosystem__hub-label">
            AI
          </text>
        </motion.g>
      </svg>

      {/* Stacked legend — primary content on narrow screens. */}
      <ul className="ecosystem__legend">
        {data.nodes.map((node) => (
          <li key={node.id} className="ecosystem__legend-item">
            <span className="mono-label ecosystem__legend-label">{node.label}</span>
            <span className="ecosystem__legend-items">{node.items.join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
