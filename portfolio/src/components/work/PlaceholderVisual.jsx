// PlaceholderVisual — themed inline SVG used as a card banner / gallery fallback
// until the user drops real screenshots into /public/showcase/.
//
// Self-contained (no external assets, no theme JS): every color is a token var
// so it tracks dark/light automatically. Each `kind` draws a distinct domain
// scene. Decorative by default (aria-hidden) — the surrounding <img alt> or
// caption carries the accessible text.
//
// Props:
//   kind:  "ortho" | "buildings" | "trees" | "drone" | "precland" | "flightlog"
//   label: optional string shown in the corner "REPLACE → …" badge
//   showBadge: boolean (default true) — render the REPLACE hint badge
//
// Usage:
//   import PlaceholderVisual from "./PlaceholderVisual.jsx";
//   <PlaceholderVisual kind="buildings" label="/showcase/geoai-detection-1.jpg" />

const GRID_ID = "pv-grid";

function SurveyGrid() {
  return (
    <>
      <defs>
        <pattern id={GRID_ID} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--border)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="240" height="150" fill="var(--bg-sunken)" />
      <rect x="0" y="0" width="240" height="150" fill={`url(#${GRID_ID})`} />
    </>
  );
}

function Ortho() {
  return (
    <>
      <SurveyGrid />
      {/* stitched tiles with subtle seams */}
      <g opacity="0.5" stroke="var(--accent)" strokeWidth="0.8" fill="none">
        <rect x="14" y="14" width="68" height="50" />
        <rect x="82" y="14" width="68" height="50" />
        <rect x="150" y="14" width="68" height="50" />
        <rect x="14" y="64" width="68" height="50" />
        <rect x="82" y="64" width="68" height="50" />
        <rect x="150" y="64" width="68" height="50" />
      </g>
      <g fill="var(--accent-weak)" opacity="0.85">
        <rect x="30" y="28" width="22" height="16" />
        <rect x="100" y="80" width="30" height="18" />
        <rect x="170" y="34" width="18" height="22" />
      </g>
    </>
  );
}

function Buildings() {
  return (
    <>
      <SurveyGrid />
      <g>
        <rect x="40" y="48" width="46" height="40" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <rect x="120" y="70" width="58" height="46" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
      </g>
      {/* detection boxes */}
      <g fill="none" stroke="var(--accent)" strokeWidth="1.6">
        <rect x="36" y="44" width="54" height="48" />
        <rect x="116" y="66" width="66" height="54" />
      </g>
      <g fontFamily="var(--font-mono)" fontSize="7" fill="var(--accent-text)">
        <rect x="36" y="34" width="52" height="10" fill="var(--accent-weak)" />
        <text x="39" y="42">ROOF +6.2m</text>
        <rect x="116" y="56" width="52" height="10" fill="var(--accent-weak)" />
        <text x="119" y="64">ROOF +4.1m</text>
      </g>
    </>
  );
}

function Trees() {
  return (
    <>
      <SurveyGrid />
      <g fill="var(--accent-weak)" stroke="var(--accent)" strokeWidth="1.2">
        <circle cx="56" cy="70" r="20" />
        <circle cx="100" cy="92" r="15" />
        <circle cx="150" cy="62" r="22" />
        <circle cx="190" cy="96" r="13" />
      </g>
      {/* CHM height bars */}
      <g fill="var(--accent)" opacity="0.85">
        <rect x="30" y="120" width="6" height="18" />
        <rect x="42" y="114" width="6" height="24" />
        <rect x="54" y="108" width="6" height="30" />
        <rect x="66" y="118" width="6" height="20" />
      </g>
      <text x="30" y="146" fontFamily="var(--font-mono)" fontSize="6.5" fill="var(--text-faint)">
        CHM ≥ 1.5m
      </text>
    </>
  );
}

function Drone() {
  return (
    <>
      <SurveyGrid />
      {/* nadir footprint cone */}
      <path d="M120 26 L70 120 L170 120 Z" fill="var(--accent-weak)" opacity="0.6" stroke="var(--accent)" strokeWidth="0.8" />
      {/* drone body */}
      <g stroke="var(--accent)" strokeWidth="1.6" fill="none">
        <circle cx="120" cy="26" r="4" fill="var(--accent)" />
        <path d="M112 18 116 22M128 18 124 22M112 34 116 30M128 34 124 30" />
        <circle cx="112" cy="18" r="3" />
        <circle cx="128" cy="18" r="3" />
        <circle cx="112" cy="34" r="3" />
        <circle cx="128" cy="34" r="3" />
      </g>
      <text x="74" y="114" fontFamily="var(--font-mono)" fontSize="6.5" fill="var(--text-faint)">
        NADIR CAPTURE
      </text>
    </>
  );
}

function PrecLand() {
  return (
    <>
      <rect x="0" y="0" width="240" height="150" fill="var(--bg-sunken)" />
      {/* AprilTag */}
      <g transform="translate(120 75)">
        <rect x="-34" y="-34" width="68" height="68" fill="var(--text)" />
        <g fill="var(--bg-sunken)">
          <rect x="-24" y="-24" width="12" height="12" />
          <rect x="0" y="-24" width="12" height="12" />
          <rect x="-12" y="-12" width="12" height="12" />
          <rect x="12" y="-12" width="12" height="12" />
          <rect x="-24" y="0" width="12" height="12" />
          <rect x="12" y="0" width="12" height="12" />
          <rect x="0" y="12" width="12" height="12" />
        </g>
      </g>
      {/* crosshair */}
      <g stroke="var(--accent)" strokeWidth="1.4" fill="none">
        <circle cx="120" cy="75" r="46" strokeDasharray="4 4" />
        <path d="M120 18v18M120 114v18M52 75h18M170 75h18" />
      </g>
      <text x="14" y="142" fontFamily="var(--font-mono)" fontSize="6.5" fill="var(--accent-text)">
        ~5–10cm · 20Hz
      </text>
    </>
  );
}

function FlightLog() {
  return (
    <>
      <rect x="0" y="0" width="240" height="150" fill="var(--bg-sunken)" />
      {/* mini telemetry chart */}
      <polyline
        points="20,90 50,70 80,96 110,58 140,80 170,46 200,72 220,52"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.6"
      />
      <line x1="20" y1="110" x2="220" y2="110" stroke="var(--border-strong)" strokeWidth="0.8" />
      {/* PASS / WARN / FAIL chips */}
      <g fontFamily="var(--font-mono)" fontSize="7">
        <rect x="20" y="122" width="42" height="14" rx="3" fill="var(--accent-weak)" />
        <text x="27" y="132" fill="var(--accent-text)">PASS</text>
        <rect x="68" y="122" width="42" height="14" rx="3" fill="none" stroke="var(--border-strong)" />
        <text x="74" y="132" fill="var(--text-muted)">WARN</text>
        <rect x="116" y="122" width="40" height="14" rx="3" fill="none" stroke="var(--accent)" />
        <text x="123" y="132" fill="var(--accent-text)">FAIL</text>
      </g>
      <text x="20" y="32" fontFamily="var(--font-mono)" fontSize="8" fill="var(--text-faint)">
        FLIGHT REPORT
      </text>
    </>
  );
}

function Cutfill() {
  // Simplified Cut/Fill heat-map: grid underlay, red cut blob + blue fill blob
  // (stepped opacity = falloff), legend bar, SAMPLE watermark. Literal hues by
  // design — the diverging ramp must not follow the orange accent token.
  return (
    <>
      <SurveyGrid />
      <defs>
        <linearGradient id="pv-cutfill-legend-sm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d64545" />
          <stop offset="0.5" stopColor="#d64545" stopOpacity="0" />
          <stop offset="0.5" stopColor="#3b6fd4" stopOpacity="0" />
          <stop offset="1" stopColor="#3b6fd4" />
        </linearGradient>
      </defs>
      {/* cut (red) */}
      <g fill="#d64545">
        <ellipse cx="72" cy="80" rx="44" ry="34" opacity="0.25" />
        <ellipse cx="72" cy="80" rx="30" ry="23" opacity="0.45" />
        <ellipse cx="72" cy="80" rx="16" ry="12" opacity="0.7" />
      </g>
      {/* fill (blue) — gap between blobs = transparent dead-band */}
      <g fill="#3b6fd4">
        <ellipse cx="172" cy="72" rx="38" ry="32" opacity="0.25" />
        <ellipse cx="172" cy="72" rx="26" ry="22" opacity="0.45" />
        <ellipse cx="172" cy="72" rx="13" ry="11" opacity="0.7" />
      </g>
      {/* legend bar */}
      <rect
        x="222"
        y="30"
        width="8"
        height="90"
        rx="2"
        fill="url(#pv-cutfill-legend-sm)"
        stroke="var(--border-strong)"
        strokeWidth="0.6"
      />
      <g fontFamily="var(--font-mono)" fontSize="6.5">
        <text x="12" y="16" fill="#d64545">
          CUT −2.1m
        </text>
        <text x="12" y="142" fill="#3b6fd4">
          FILL +1.8m
        </text>
      </g>
      <text
        x="120"
        y="80"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="20"
        letterSpacing="0.3em"
        fill="var(--text)"
        opacity="0.14"
        transform="rotate(-12 120 75)"
      >
        SAMPLE
      </text>
    </>
  );
}

const SCENES = {
  ortho: Ortho,
  buildings: Buildings,
  trees: Trees,
  drone: Drone,
  precland: PrecLand,
  flightlog: FlightLog,
  cutfill: Cutfill,
};

export default function PlaceholderVisual({ kind = "ortho", label, showBadge = true }) {
  const Scene = SCENES[kind] || Ortho;
  return (
    <div className="pv" data-kind={kind} aria-hidden="true">
      <svg
        className="pv__svg"
        viewBox="0 0 240 150"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        focusable="false"
      >
        <Scene />
      </svg>
      {showBadge && (
        <span className="pv__badge mono">REPLACE → {label || `/showcase/${kind}.jpg`}</span>
      )}
    </div>
  );
}
