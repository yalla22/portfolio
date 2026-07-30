import { motion } from "framer-motion";
import Icon from "../common/Icon.jsx";
import "./spine.css";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span className="theme-toggle__track">
        <motion.span
          className="theme-toggle__knob"
          layout
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          style={{ justifySelf: isDark ? "end" : "start" }}
        >
          <motion.span
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex" }}
          >
            <Icon name={isDark ? "moon" : "sun"} size={13} />
          </motion.span>
        </motion.span>
      </span>
    </button>
  );
}
