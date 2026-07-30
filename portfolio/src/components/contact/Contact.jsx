import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import ContactLinks from "./ContactLinks.jsx";
import AvailabilityNote from "./AvailabilityNote.jsx";
import Reveal from "../common/Reveal.jsx";
import Button from "../common/Button.jsx";
import Icon from "../common/Icon.jsx";
import { profile } from "../../data/profile.js";
import "./contact.css";

export default function Contact() {
  return (
    <Section id="contact">
      <SectionHeader
        index="06"
        title="Contact"
        lead="Open to roles as an immediate joiner. The fastest way to reach me is email."
      />
      <div className="editorial-grid contact__layout">
        <div className="contact__meta">
          <AvailabilityNote />
        </div>
        <div className="contact__panel">
          <Reveal as="div">
            <ContactLinks />
          </Reveal>
          <Reveal as="div" delay={0.1} className="contact__cta">
            <Button
              as="a"
              href={profile.resume}
              variant="filled"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="download" size={16} />
              Download Résumé
            </Button>
            <Button as="a" href={`mailto:${profile.email}`} variant="ghost">
              <Icon name="mail" size={16} />
              Say hello
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
