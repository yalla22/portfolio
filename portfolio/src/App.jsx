import { Suspense, lazy, useEffect, useState } from "react";
import { useTheme } from "./lib/useTheme.js";
import { useScrollSpy } from "./lib/useScrollSpy.js";
import { useScrollProgress } from "./lib/useScrollProgress.js";
import { navSections } from "./data/profile.js";

import Spine from "./components/spine/Spine.jsx";
import MobileTopBar from "./components/spine/MobileTopBar.jsx";
import MobileNavSheet from "./components/spine/MobileNavSheet.jsx";

import Hero from "./components/hero/Hero.jsx";
import ProofMarquee from "./components/marquee/ProofMarquee.jsx";
import Work from "./components/work/Work.jsx";
import StickyResume from "./components/StickyResume.jsx";
import Footer from "./components/Footer.jsx";

// Below-the-fold sections are code-split so the above-the-fold hero ships first.
const VisualShowcase = lazy(() =>
  import("./components/showcase/VisualShowcase.jsx")
);
const Stack = lazy(() => import("./components/stack/Stack.jsx"));
const Timeline = lazy(() => import("./components/timeline/Timeline.jsx"));
const About = lazy(() => import("./components/about/About.jsx"));
const Contact = lazy(() => import("./components/contact/Contact.jsx"));

const SECTION_IDS = navSections.map((s) => s.id);

export default function App() {
  const { theme, toggle } = useTheme();
  const activeId = useScrollSpy(SECTION_IDS);
  const progress = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Show the mobile bar hairline only after scrolling past the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Spine
        activeId={activeId}
        progress={progress}
        theme={theme}
        onToggle={toggle}
      />

      <MobileTopBar
        theme={theme}
        onToggle={toggle}
        onMenu={() => setMenuOpen((o) => !o)}
        scrolled={scrolled}
        menuOpen={menuOpen}
      />
      <MobileNavSheet
        open={menuOpen}
        activeId={activeId}
        onClose={() => setMenuOpen(false)}
      />

      <div className="app-shell">
        <main id="main" tabIndex={-1}>
          <Hero />
          <ProofMarquee />
          <Suspense fallback={null}>
            <VisualShowcase />
            <div className="section-rule" aria-hidden="true" />
            <Work />
            <div className="section-rule" aria-hidden="true" />
            <Stack />
            <div className="section-rule" aria-hidden="true" />
            <Timeline />
            <div className="section-rule" aria-hidden="true" />
            <About />
            <div className="section-rule" aria-hidden="true" />
            <Contact />
          </Suspense>
        </main>
        <Footer />
      </div>

      <StickyResume />
    </>
  );
}
