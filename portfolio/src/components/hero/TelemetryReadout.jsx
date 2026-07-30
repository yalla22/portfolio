import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../lib/useReducedMotion.js";

const FIXED = { alt: 42, spd: 6.0, lat: 17.385, hdg: 94 };

const fmt = {
  alt: (v) => `ALT ${v.toFixed(0)} m`,
  spd: (v) => `SPD ${v.toFixed(1)} m/s`,
  lat: (v) => `LAT ${v.toFixed(4)}° N`,
  hdg: (v) => `HDG ${v.toFixed(0).padStart(3, "0")}°`,
};

// Slow eased rAF ticker — instrument-like drift, not jitter.
// Writes straight to the DOM via refs so it does not re-render React ~60x/sec.
export default function TelemetryReadout({ active }) {
  const reduced = useReducedMotion();
  const refs = {
    alt: useRef(null),
    spd: useRef(null),
    lat: useRef(null),
    hdg: useRef(null),
  };
  const raf = useRef(0);

  useEffect(() => {
    const write = (vals) => {
      for (const k of ["alt", "spd", "lat", "hdg"]) {
        if (refs[k].current) refs[k].current.textContent = fmt[k](vals[k]);
      }
    };

    if (reduced || !active) {
      write(FIXED);
      return;
    }

    const start = performance.now();
    const loop = (now) => {
      const t = (now - start) / 1000;
      write({
        alt: FIXED.alt + Math.sin(t * 0.4) * 3,
        spd: FIXED.spd + Math.sin(t * 0.6 + 1) * 0.4,
        lat: FIXED.lat + Math.sin(t * 0.2) * 0.0008,
        hdg: (FIXED.hdg + Math.sin(t * 0.3) * 6 + 360) % 360,
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced]);

  return (
    <div className="telemetry" role="status" aria-label="Flight telemetry">
      <span ref={refs.alt}>{fmt.alt(FIXED.alt)}</span>
      <span className="telemetry__sep">·</span>
      <span ref={refs.spd}>{fmt.spd(FIXED.spd)}</span>
      <span className="telemetry__sep">·</span>
      <span ref={refs.lat}>{fmt.lat(FIXED.lat)}</span>
      <span className="telemetry__sep">·</span>
      <span ref={refs.hdg}>{fmt.hdg(FIXED.hdg)}</span>
    </div>
  );
}
