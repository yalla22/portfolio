import { navSections, socials } from "../../data/profile.js";
import SpineNavItem from "./SpineNavItem.jsx";
import ProgressLine from "./ProgressLine.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import Icon from "../common/Icon.jsx";
import "./spine.css";

export default function Spine({ activeId, progress, theme, onToggle }) {
  const handleNavigate = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <nav className="spine" aria-label="Primary">
      <a className="spine__wordmark" href="#top" aria-label="Back to top">
        JYY <span className="spine__waypoint" aria-hidden="true">◦</span>
      </a>

      <div className="spine__nav-wrap">
        <ProgressLine progress={progress} />
        <ul className="spine-nav">
          {navSections.map((s) => (
            <SpineNavItem
              key={s.id}
              section={s}
              active={activeId === s.id}
              onNavigate={handleNavigate}
            />
          ))}
        </ul>
      </div>

      <div className="spine__footer">
        <ThemeToggle theme={theme} onToggle={onToggle} />
        <div className="spine__socials">
          {socials
            .filter((s) => s.icon === "github" || s.icon === "linkedin")
            .map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="spine__social"
                aria-label={s.label}
              >
                <Icon name={s.icon} size={16} />
              </a>
            ))}
        </div>
      </div>
    </nav>
  );
}
