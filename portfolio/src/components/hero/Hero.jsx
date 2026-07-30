import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { profile } from "../../data/profile.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";
import ContourField from "./ContourField.jsx";
import FlightPathTrace from "./FlightPathTrace.jsx";
import TelemetryReadout from "./TelemetryReadout.jsx";
import ParallaxLayer from "./ParallaxLayer.jsx";
import CtaGroup from "./CtaGroup.jsx";
import HeroPortrait from "./HeroPortrait.jsx";
import HeroStats from "./HeroStats.jsx";
import HeroContactRow from "./HeroContactRow.jsx";
import CoordReadout from "../common/CoordReadout.jsx";
import "./hero.css";

/**
 * Hero — full-viewport premium parallax hero.
 *
 * Layers (back → front): ContourField + FlightPathTrace (both inside
 * pointer/scroll ParallaxLayers), TelemetryReadout, then the content grid:
 *   left  = eyebrow name, role headline, tagline, subline, CTAs, contact row
 *   right = framed portrait + 4 animated stat tiles
 *
 * Parallax + telemetry write to the DOM via refs/CSS vars (no React state),
 * and are disabled under reduced-motion / coarse pointers.
 *
 * Props: none. Mount once near the top of <main>. id="top".
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const [active, setActive] = useState(true);

  // Pause canvas animation when off-screen or tab hidden.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setActive(onScreen && !document.hidden);
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    const onVis = () => update();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const fade = (delay) =>
    reduced
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE, delay },
        };

  return (
    <section id="top" className="hero" ref={sectionRef} aria-label="Introduction">
      <div className="hero__canvas" aria-hidden="true">
        <ParallaxLayer depth={0.04} className="hero__layer">
          <ContourField />
        </ParallaxLayer>
        <ParallaxLayer depth={0.08} className="hero__layer">
          <FlightPathTrace active={active} />
        </ParallaxLayer>
        <TelemetryReadout active={active} />
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <motion.p className="eyebrow hero__eyebrow" {...fade(0)}>
            Flight Deck
          </motion.p>

          <motion.p className="hero__name mono" {...fade(0.06)}>
            {profile.name}
          </motion.p>

          <motion.h1 className="hero__role" {...fade(0.12)}>
            {profile.heroRole}
          </motion.h1>

          <motion.p className="hero__tagline" {...fade(0.2)}>
            {profile.tagline}
          </motion.p>

          <motion.p className="hero__subline" {...fade(0.28)}>
            {profile.subline}
          </motion.p>

          <motion.div {...fade(0.36)}>
            <CtaGroup />
          </motion.div>

          <motion.div {...fade(0.44)}>
            <HeroContactRow />
          </motion.div>

          <motion.div className="hero__coords" {...fade(0.52)}>
            <CoordReadout />
          </motion.div>
        </div>

        <motion.aside className="hero__rail" {...fade(0.3)}>
          <HeroPortrait />
          <HeroStats />
        </motion.aside>
      </div>
    </section>
  );
}
