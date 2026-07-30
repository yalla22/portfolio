import { marqueeTech } from "../../data/skills.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import "./marquee.css";

// ProofMarquee — an auto-scrolling, seamless ticker of the full tech stack.
//
// Sits directly under the Hero as a "proof strip": a calm, infinitely looping
// ribbon of the keywords from data/skills.js (marqueeTech). The track is
// duplicated so the CSS keyframe can translate -50% for a seamless wrap.
//
// Reduced motion: the animation is paused (CSS @media) and the strip becomes a
// static, wrapping, horizontally-scrollable list — no autoplay, no jank.
//
// No props. Reads marqueeTech from data/skills.js.
export default function ProofMarquee() {
  const reduced = useReducedMotion();
  // Two copies for the seamless -50% loop.
  const items = reduced ? marqueeTech : [...marqueeTech, ...marqueeTech];

  return (
    <section
      className="proof-marquee"
      aria-label="Technology stack"
      data-reduced={reduced ? "true" : "false"}
    >
      {/* Single accessible copy of the un-duplicated stack for screen readers.
          The visible animated track below stays aria-hidden so the duplicated
          loop is never announced twice. */}
      <ul className="visually-hidden">
        {marqueeTech.map((tech, i) => (
          <li key={`a11y-${tech}-${i}`}>{tech}</li>
        ))}
      </ul>

      <div className="proof-marquee__viewport">
        <ul className="proof-marquee__track" aria-hidden="true">
          {items.map((tech, i) => (
            <li className="proof-marquee__item" key={`${tech}-${i}`}>
              <span className="proof-marquee__dot" aria-hidden="true">
                ◦
              </span>
              <span className="proof-marquee__label">{tech}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
