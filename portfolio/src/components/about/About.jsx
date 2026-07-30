import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import ProfilePhoto from "./ProfilePhoto.jsx";
import Reveal from "../common/Reveal.jsx";
import { profile } from "../../data/profile.js";
import "./about.css";

export default function About() {
  return (
    <Section id="about">
      <SectionHeader index="05" title="About" />
      <div className="about__layout editorial-grid">
        <Reveal as="div" className="about__photo-col">
          <ProfilePhoto />
        </Reveal>
        <Reveal as="div" delay={0.08} className="about__bio prose">
          {profile.bio.map((p, i) => (
            <p key={i} className="about__para">
              {p}
            </p>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
