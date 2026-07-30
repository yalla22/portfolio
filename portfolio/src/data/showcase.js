// Visual Showcase data — one capability panel per item.
//
// `visual` is the placeholder-art key (PlaceholderVisual renders a themed SVG
// when the real screenshot at `img` is missing or fails to load). These keys
// intentionally match the `placeholder` keys used in data/projects.js so the
// same PlaceholderVisual art is reused across the Showcase and the case-study
// galleries.
//
// `projectId` deep-links a panel to its case study in the Work section.
//
// REPLACE: drop real screenshots at the `img` paths under public/showcase/.
// Until those files exist the inline SVG placeholder is shown automatically.
export const showcaseItems = [
  {
    id: "orthomosaic",
    title: "Orthomosaic Imagery",
    caption:
      "Stitched RGB GeoTIFF surveys, tiled for inference up to 14,400×7,200 px.",
    visual: "ortho",
    img: "/showcase/orthomosaic.jpg",
    projectId: "aerial-object-detection",
  },
  {
    id: "buildings",
    title: "Building Detection",
    caption:
      "Zero-shot LangSAM rooftops + nDSM height filter drops flat false positives.",
    visual: "buildings",
    img: "/showcase/building-detection.jpg",
    projectId: "geoai-detection",
  },
  {
    id: "trees",
    title: "Tree-Crown Detection",
    caption:
      "DeepForest crowns; CHM = DSM−DTM separates trees from grass (≥1.5 m).",
    visual: "trees",
    img: "/showcase/tree-detection.jpg",
    projectId: "geoai-detection",
  },
  {
    id: "cutfill",
    title: "Cut/Fill Heat-Map",
    caption:
      "Propeller-style diverging render — cut (red) / fill (blue) with a transparent dead-band, editable colour stops, Smart-base default.",
    visual: "cutfill",
    img: "/showcase/cutfill-heatmap.svg",
    projectId: "marut-survey-webapp",
  },
  {
    id: "drone",
    title: "Drone Imagery",
    caption: "Nadir + oblique captures across the survey fleet.",
    visual: "drone",
    img: "/showcase/drone-imagery.jpg",
    projectId: "aerial-object-detection",
  },
  {
    id: "precland",
    title: "Precision Landing",
    caption:
      "AprilTag-guided autonomous landing — proven stationary-tag landings (design target ~5–10 cm), 20 Hz control.",
    visual: "precland",
    img: "/showcase/precision-landing.jpg",
    projectId: "precision-landing",
  },
  {
    id: "flightlog",
    title: "Flight-Log Analyzer Reports",
    caption:
      "Auto-generated PDF crash/health reports — 50+ checks, PASS/WARN/FAIL.",
    visual: "flightlog",
    img: "/showcase/flight-log-report.jpg",
    projectId: "flight-log-analyzer",
  },
];
