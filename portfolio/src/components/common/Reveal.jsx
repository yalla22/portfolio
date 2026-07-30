import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";

// Scroll-reveal: fade + translateY, fires once.
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  as = "div",
  className = "",
  ...rest
}) {
  const [ref, inView] = useInView();
  const reduced = useReducedMotion();
  const show = reduced || inView;
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : y }}
      transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
