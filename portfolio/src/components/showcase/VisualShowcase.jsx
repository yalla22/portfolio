import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import ShowcasePanel from "./ShowcasePanel.jsx";
import { showcaseItems } from "../../data/showcase.js";
import "./showcase.css";

// VisualShowcase — full-bleed capability gallery (section id="showcase", 02).
//
// One ShowcasePanel per capability (orthomosaic, building detection,
// tree-crown detection, drone imagery, precision landing, flight-log report).
// Each panel alternates layout side, scroll-reveals, lazy-loads its visual, and
// deep-links into the matching Work case study.
//
// Reads data/showcase.js + (transitively, for placeholder art) project visuals.
// Edits no shared files. The whole section is safe to lazy()-load below the fold.
//
// Usage (integrator):
//   import VisualShowcase from "./components/showcase/VisualShowcase.jsx";
//   // or:  import Showcase from "./components/showcase/Showcase.jsx";
//   <VisualShowcase />
export default function VisualShowcase() {
  return (
    <Section id="showcase" className="section--tight showcase">
      <SectionHeader
        index="02"
        title="Showcase"
        lead="The capabilities behind the work — drone imagery, geospatial AI, and autonomous flight, shown end to end. Replace the placeholders with real captures any time."
      />

      <ul className="showcase-grid" role="list">
        {showcaseItems.map((item, i) => (
          <ShowcasePanel
            key={item.id}
            item={item}
            index={i}
            align={i % 2 === 0 ? "left" : "right"}
          />
        ))}
      </ul>
    </Section>
  );
}
