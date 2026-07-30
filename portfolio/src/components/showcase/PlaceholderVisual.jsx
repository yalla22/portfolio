import "./showcase.css";

// PlaceholderVisual — themed inline SVG stand-ins for real screenshots.
//
// One distinct illustration per `visual` key (also reused by the Work
// case-study galleries via the matching `placeholder` keys in projects.js).
// Everything is drawn with `currentColor` + token-driven CSS classes so it
// inherits dark/light parity automatically. A corner mono badge tells the user
// exactly which file to drop in to replace it.
//
// Props:
//   visual  string  one of: ortho | drone | buildings | trees | precland | flightlog
//   replace string  optional file path shown in the corner badge (e.g. "/showcase/x.jpg")
//   className string
//
// All art lives inside a 0 0 320 200 viewBox (16:10) and scales via
// preserveAspectRatio, so it never overflows its container.

function ArtOrtho() {
  // Survey-grid raster with tile seams + a scan tile highlight.
  const cells = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * 40}
          y={r * 40}
          width={40}
          height={40}
          className="pv-cell"
          opacity={0.25 + ((r + c) % 3) * 0.18}
        />
      );
    }
  }
  return (
    <>
      <g className="pv-fill">{cells}</g>
      <g className="pv-line" fill="none">
        {[40, 80, 120, 160, 200, 240, 280].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={200} />
        ))}
        {[40, 80, 120, 160].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={320} y2={y} />
        ))}
      </g>
      <rect
        x={120}
        y={40}
        width={40}
        height={40}
        className="pv-stroke-accent"
        fill="none"
      />
    </>
  );
}

function ArtDrone() {
  // Nadir capture frame with a quad-rotor silhouette + footprint cone.
  return (
    <>
      <g className="pv-fill">
        <rect x={20} y={120} width={280} height={60} opacity={0.3} />
      </g>
      <g className="pv-stroke-accent" fill="none">
        <path d="M160 40 L70 130 M160 40 L250 130" />
        <line x1={70} y1={130} x2={250} y2={130} strokeDasharray="4 4" />
      </g>
      <g className="pv-line" fill="none">
        <line x1={132} y1={40} x2={188} y2={40} />
        <line x1={140} y1={32} x2={140} y2={48} />
        <line x1={180} y1={32} x2={180} y2={48} />
      </g>
      <g className="pv-fill">
        <circle cx={140} cy={32} r={6} opacity={0.55} />
        <circle cx={180} cy={32} r={6} opacity={0.55} />
        <circle cx={140} cy={48} r={6} opacity={0.55} />
        <circle cx={180} cy={48} r={6} opacity={0.55} />
        <rect x={150} y={36} width={20} height={8} rx={2} opacity={0.7} />
      </g>
    </>
  );
}

function ArtBuildings() {
  // Rooftops with bounding boxes + an "ROOF +6.2 m" height tag.
  return (
    <>
      <g className="pv-fill">
        <rect x={36} y={96} width={70} height={70} opacity={0.4} />
        <rect x={130} y={70} width={90} height={96} opacity={0.45} />
        <rect x={240} y={110} width={52} height={56} opacity={0.4} />
      </g>
      <g className="pv-stroke-accent" fill="none">
        <rect x={36} y={96} width={70} height={70} />
        <rect x={130} y={70} width={90} height={96} />
        <rect x={240} y={110} width={52} height={56} />
      </g>
      <g className="pv-tag">
        <rect x={130} y={50} width={84} height={16} rx={3} className="pv-tag-bg" />
        <text x={134} y={62} className="pv-tag-text">
          ROOF +6.2 m
        </text>
      </g>
    </>
  );
}

function ArtTrees() {
  // Green crowns with CHM height bars on the side.
  const crowns = [
    [70, 110, 26],
    [130, 90, 32],
    [200, 120, 24],
    [250, 95, 28],
  ];
  return (
    <>
      <g className="pv-green">
        {crowns.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} opacity={0.55} />
        ))}
      </g>
      <g className="pv-stroke-green" fill="none">
        {crowns.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g className="pv-fill">
        {[
          [24, 40],
          [34, 28],
          [44, 52],
        ].map(([x, h], i) => (
          <rect
            key={i}
            x={x}
            y={170 - h}
            width={6}
            height={h}
            className="pv-bar-accent"
          />
        ))}
      </g>
      <text x={20} y={186} className="pv-mini">
        CHM ≥1.5 m
      </text>
    </>
  );
}

function ArtPrecland() {
  // Concentric AprilTag-ish target + crosshair.
  return (
    <>
      <g className="pv-stroke" fill="none">
        <rect x={120} y={60} width={80} height={80} />
      </g>
      <g className="pv-fill">
        <rect x={132} y={72} width={56} height={56} opacity={0.7} />
        <rect x={144} y={84} width={32} height={32} className="pv-invert" />
        <rect x={154} y={94} width={12} height={12} opacity={0.9} />
      </g>
      <g className="pv-stroke-accent" fill="none">
        <line x1={160} y1={20} x2={160} y2={180} strokeDasharray="3 5" />
        <line x1={40} y1={100} x2={280} y2={100} strokeDasharray="3 5" />
        <circle cx={160} cy={100} r={50} />
      </g>
    </>
  );
}

function ArtFlightlog() {
  // Mini sensor chart + PASS/WARN/FAIL chips.
  return (
    <>
      <g className="pv-line" fill="none">
        <polyline points="20,140 60,110 100,120 140,70 180,90 220,50 260,80 300,40" />
      </g>
      <g className="pv-stroke" fill="none" opacity={0.5}>
        <line x1={20} y1={160} x2={300} y2={160} />
        <line x1={20} y1={30} x2={20} y2={160} />
      </g>
      <g className="pv-chip">
        <rect x={210} y={120} width={34} height={14} rx={3} className="pv-chip-pass" />
        <rect x={250} y={120} width={34} height={14} rx={3} className="pv-chip-warn" />
        <rect x={210} y={140} width={74} height={14} rx={3} className="pv-chip-fail" />
        <text x={216} y={131} className="pv-chip-text">PASS</text>
        <text x={256} y={131} className="pv-chip-text">WARN</text>
        <text x={216} y={151} className="pv-chip-text">FAIL · power</text>
      </g>
    </>
  );
}

function ArtCutfill() {
  // Diverging Cut/Fill heat-map over a faint survey grid: red cut blob + blue
  // fill blob (3 concentric steps each = soft falloff), a transparent dead-band
  // gap between them, and a colour-stop legend bar on the right edge.
  const cells = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * 40}
          y={r * 40}
          width={40}
          height={40}
          className="pv-cell"
          opacity={0.08 + ((r + c) % 3) * 0.06}
        />
      );
    }
  }
  return (
    <>
      <defs>
        <linearGradient id="pv-cutfill-legend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d64545" />
          <stop offset="0.5" stopColor="#d64545" stopOpacity="0" />
          <stop offset="0.5" stopColor="#3b6fd4" stopOpacity="0" />
          <stop offset="1" stopColor="#3b6fd4" />
        </linearGradient>
      </defs>
      {/* faint survey-grid "map" underlay */}
      <g className="pv-fill">{cells}</g>
      <g className="pv-line" fill="none" opacity={0.5}>
        {[40, 80, 120, 160, 200, 240, 280].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={200} />
        ))}
        {[40, 80, 120, 160].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={320} y2={y} />
        ))}
      </g>
      {/* CUT region — concentric stepped opacity reads as a heat falloff */}
      <g className="pv-heat-cut">
        <path
          d="M28 118 C20 82 48 48 92 46 C128 44 148 70 140 100 C132 132 96 152 62 148 C40 145 32 136 28 118 Z"
          opacity={0.25}
        />
        <path
          d="M44 112 C39 86 60 62 92 60 C118 58 132 76 126 98 C120 122 94 136 68 133 C52 131 47 124 44 112 Z"
          opacity={0.45}
        />
        <path
          d="M60 106 C57 90 71 76 91 75 C107 74 116 85 112 98 C108 112 92 120 76 118 C66 117 62 113 60 106 Z"
          opacity={0.7}
        />
      </g>
      {/* FILL region — a visible gap to the cut blob is the transparent dead-band */}
      <g className="pv-heat-fill">
        <path
          d="M196 132 C182 100 200 62 240 54 C272 48 292 70 288 100 C284 132 254 156 224 154 C208 153 201 145 196 132 Z"
          opacity={0.25}
        />
        <path
          d="M208 126 C198 102 212 74 240 68 C263 64 277 80 274 101 C271 125 249 141 228 139 C217 138 212 134 208 126 Z"
          opacity={0.45}
        />
        <path
          d="M220 118 C214 103 223 86 240 82 C254 80 262 90 260 102 C258 116 245 126 233 124 C226 123 223 121 220 118 Z"
          opacity={0.7}
        />
      </g>
      {/* right-edge colour-stop legend with stop handles */}
      <rect
        x={296}
        y={40}
        width={10}
        height={120}
        rx={2}
        fill="url(#pv-cutfill-legend)"
        className="pv-line"
        strokeWidth={0.75}
      />
      <rect x={294} y={64} width={14} height={6} rx={1} className="pv-stroke-heat-cut" fill="var(--bg-elevated)" strokeWidth={1} />
      <rect x={294} y={130} width={14} height={6} rx={1} className="pv-stroke-heat-fill" fill="var(--bg-elevated)" strokeWidth={1} />
      {/* corner mono readouts */}
      <text x={12} y={20} className="pv-mini pv-heat-cut">
        CUT −2.1m
      </text>
      <text x={12} y={192} className="pv-mini pv-heat-fill">
        FILL +1.8m
      </text>
      {/* unmistakable sample-art watermark */}
      <text
        x={160}
        y={106}
        textAnchor="middle"
        className="pv-watermark"
        transform="rotate(-12 160 100)"
      >
        SAMPLE
      </text>
    </>
  );
}

const ART = {
  ortho: ArtOrtho,
  drone: ArtDrone,
  buildings: ArtBuildings,
  trees: ArtTrees,
  precland: ArtPrecland,
  flightlog: ArtFlightlog,
  cutfill: ArtCutfill,
};

export default function PlaceholderVisual({ visual, replace, className = "" }) {
  const Art = ART[visual] || ArtOrtho;
  return (
    <div className={`placeholder-visual ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
        className="placeholder-visual__svg"
        role="img"
      >
        <rect x={0} y={0} width={320} height={200} className="pv-bg" />
        <Art />
      </svg>
      {replace && (
        <span className="placeholder-visual__badge mono">
          REPLACE → {replace}
        </span>
      )}
    </div>
  );
}
