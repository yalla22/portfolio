import { motion } from "framer-motion";
import { tickSpring } from "../../lib/motion.js";
import "./spine.css";

export default function SpineNavItem({ section, active, onNavigate }) {
  return (
    <li className="spine-nav__item">
      {active && (
        <motion.span
          layoutId="spine-tick"
          className="spine-nav__tick"
          transition={tickSpring}
        />
      )}
      <a
        href={`#${section.id}`}
        className={`spine-nav__link${active ? " is-active" : ""}`}
        aria-current={active ? "true" : undefined}
        onClick={(e) => onNavigate?.(e, section.id)}
      >
        <span className="spine-nav__num">{section.index}</span>
        <span className="spine-nav__label">{section.label}</span>
      </a>
    </li>
  );
}
