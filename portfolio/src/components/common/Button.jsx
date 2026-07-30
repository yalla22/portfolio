import { useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import "./common.css";

// Magnetic button — nudges ~3px toward the cursor on desktop.
export default function Button({
  as = "button",
  variant = "filled",
  children,
  magnetic = true,
  className = "",
  ...rest
}) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const MotionTag = motion[as] || motion.button;

  const handleMove = (e) => {
    if (reduced || !magnetic || !ref.current) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
      return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 6;
    // Drive the offset via CSS vars so the stylesheet's hover-lift/active-press
    // transforms compose with the magnetic nudge instead of being overridden.
    ref.current.style.setProperty("--mag-x", `${x}px`);
    ref.current.style.setProperty("--mag-y", `${y}px`);
  };
  const reset = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--mag-x", "0px");
    ref.current.style.setProperty("--mag-y", "0px");
  };

  return (
    <MotionTag
      ref={ref}
      className={`btn btn--${variant} ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
