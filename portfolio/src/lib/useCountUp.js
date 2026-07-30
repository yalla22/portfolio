import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion.js";

// Counts up to `target` once `active` becomes true.
export function useCountUp(target, active, { duration = 1200, decimals = 0 } = {}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(active ? target : 0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduced]);

  const factor = Math.pow(10, decimals);
  return (Math.round(value * factor) / factor).toFixed(decimals);
}
