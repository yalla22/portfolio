import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";
import "./common.css";

export default function SectionHeader({ index, title, lead }) {
  const [ref, inView] = useInView();
  const reduced = useReducedMotion();
  const show = reduced || inView;

  return (
    <header className="section-header editorial-grid" ref={ref}>
      <div>
        <span className="mono-label section-header__index">
          {index} — {title.toUpperCase()}
        </span>
      </div>
      <div>
        <motion.h2
          className="section-header__title"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 16 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {title}
        </motion.h2>
        {lead && <p className="section-header__lead">{lead}</p>}
      </div>
    </header>
  );
}
