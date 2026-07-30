import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import SkillCard from "./SkillCard.jsx";
import EcosystemDiagram from "./EcosystemDiagram.jsx";
import { skillGroups, ecosystem } from "../../data/skills.js";
import "./stack.css";

export default function Stack() {
  return (
    <Section id="stack">
      <SectionHeader
        index="03"
        title="Stack"
        lead="The capability matrix — grouped by domain. Tools used in shipped work, not a wish list."
      />

      <div className="skill-grid">
        {skillGroups.map((g, i) => (
          <SkillCard key={g.id} group={g} index={i} />
        ))}
      </div>

      <div className="stack__ecosystem">
        <span className="mono-label stack__ecosystem-kicker">
          How it connects
        </span>
        <EcosystemDiagram data={ecosystem} />
      </div>
    </Section>
  );
}
