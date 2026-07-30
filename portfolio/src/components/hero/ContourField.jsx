import { memo, useMemo } from "react";

// Deterministic faint topographic contour field (DSM/DTM motif).
// Pure SVG, memoized — rendered once.
function buildContours() {
  const lines = [];
  const W = 1000;
  const H = 600;
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const baseY = (H / (rows + 1)) * (r + 1);
    // deterministic pseudo-noise via trig
    let d = `M 0 ${baseY.toFixed(1)}`;
    const seg = 10;
    for (let i = 1; i <= seg; i++) {
      const x = (W / seg) * i;
      const y =
        baseY +
        Math.sin(i * 0.9 + r * 1.3) * 26 +
        Math.cos(i * 1.7 + r * 0.6) * 14;
      const cx = x - W / seg / 2;
      const cy =
        baseY +
        Math.sin((i - 0.5) * 0.9 + r * 1.3) * 30 +
        Math.cos((i - 0.5) * 1.7 + r * 0.6) * 12;
      d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    lines.push(d);
  }
  return lines;
}

function ContourField() {
  const lines = useMemo(buildContours, []);
  return (
    <svg
      className="contour-field"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="var(--contour)"
        strokeWidth="1.5"
        style={{ opacity: 0.9 }}
      >
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

export default memo(ContourField);
