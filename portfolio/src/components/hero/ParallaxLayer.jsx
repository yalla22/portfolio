import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../lib/useReducedMotion.js";

/**
 * ParallaxLayer
 * Wraps a (usually decorative) child and translates it on pointer + scroll.
 *
 * Writes transform via CSS custom properties (--px / --py) straight to the DOM
 * node every animation frame — never through React state — so it costs zero
 * re-renders (mirrors the TelemetryReadout ref pattern).
 *
 * Disabled entirely under prefers-reduced-motion or coarse pointers (touch),
 * where there is no hover to drive the effect.
 *
 * Props:
 *   depth?: number   — parallax strength multiplier (e.g. 0.04 = subtle). Default 0.05.
 *   className?: string
 *   children: ReactNode
 *
 * The host stylesheet must give the layer:
 *   transform: translate3d(var(--px,0), var(--py,0), 0); will-change: transform;
 */
const MAX_OFFSET = 12; // px — capped so layers never cause overflow at any width.

export default function ParallaxLayer({ depth = 0.05, className = "", children, ...rest }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;

    if (reduced || coarse) {
      el.style.setProperty("--px", "0px");
      el.style.setProperty("--py", "0px");
      return;
    }

    let raf = 0;
    let pending = false;
    // pointer offset from viewport center, normalized -1..1
    let pnx = 0;
    let pny = 0;
    let scrollY = window.scrollY || 0;

    const clamp = (v) => Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, v));

    const apply = () => {
      pending = false;
      const x = clamp(pnx * (MAX_OFFSET) * (depth / 0.05));
      // pointer Y plus a gentle scroll drift
      const y = clamp(
        pny * (MAX_OFFSET) * (depth / 0.05) + scrollY * depth
      );
      el.style.setProperty("--px", `${x.toFixed(2)}px`);
      el.style.setProperty("--py", `${y.toFixed(2)}px`);
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(apply);
    };

    const onPointer = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pnx = (e.clientX / w - 0.5) * 2;
      pny = (e.clientY / h - 0.5) * 2;
      schedule();
    };
    const onScroll = () => {
      scrollY = window.scrollY || 0;
      schedule();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [depth, reduced]);

  return (
    <div ref={ref} className={`parallax-layer ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
