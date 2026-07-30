import { useEffect, useRef } from "react";
import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import Reveal from "../common/Reveal.jsx";
import Icon from "../common/Icon.jsx";
import TimelineNode from "./TimelineNode.jsx";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { timeline, certs } from "../../data/experience.js";
import "./timeline.css";

/**
 * Timeline
 * Interactive vertical career rail: Education -> Rooman -> Marut (-> milestones),
 * read oldest -> newest. Nodes reveal on scroll and expand on hover/focus.
 * The connecting rail draws a progress fill linked to the section's scroll
 * position (written to a CSS custom property via a rAF-throttled handler —
 * no React state, so no re-renders). A Certifications strip sits below.
 *
 * Replaces the old FlightPath/path section. Keeps id="path" so the existing
 * nav spine label "Path" / useScrollSpy continue to resolve unchanged.
 *
 * Props: none.
 * Import:  import Timeline from "./components/timeline/Timeline.jsx";
 * Usage:   <Timeline />
 */
export default function Timeline() {
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return;

    if (reduced) {
      fill.style.setProperty("--tl-progress", "1");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = rail.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Trigger band: start filling when the rail top passes 65% of the
      // viewport, complete when the rail bottom reaches 35%.
      const start = vh * 0.65;
      const end = vh * 0.35;
      const span = rect.height + (start - end);
      const travelled = start - rect.top;
      const p = span > 0 ? travelled / span : 0;
      fill.style.setProperty("--tl-progress", String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <Section id="path">
      <SectionHeader
        index="04"
        title="Path"
        lead="The route so far — education and engineering experience along one vertical rail."
      />

      <div className="tl-layout">
        <div className="tl-rail" ref={railRef}>
          <span className="tl-rail__track" aria-hidden="true">
            <span className="tl-rail__fill" ref={fillRef} />
          </span>
          <ol className="tl-list">
            {timeline.map((item, i) => (
              <TimelineNode
                key={item.id}
                item={item}
                index={i}
                last={i === timeline.length - 1}
              />
            ))}
          </ol>
        </div>

        <Reveal as="div" className="tl-certs" delay={0.1}>
          <span className="mono-label tl-certs__label">Certifications</span>
          <ul className="tl-cert-list">
            {certs.map((c) => (
              <li key={c.id} className="tl-cert">
                <span className="tl-cert__icon" aria-hidden="true">
                  <Icon name="arrow-up-right" size={14} />
                </span>
                <span className="tl-cert__text">
                  <strong className="tl-cert__title">{c.title}</strong>
                  <span className="tl-cert__issuer">{c.issuer}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
