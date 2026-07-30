import ThemeToggle from "./ThemeToggle.jsx";
import "./spine.css";

export default function MobileTopBar({ theme, onToggle, onMenu, scrolled, menuOpen }) {
  return (
    <header className={`mobile-bar${scrolled ? " is-scrolled" : ""}`}>
      <a className="mobile-bar__wordmark" href="#top" aria-label="Back to top">
        JYY <span className="spine__waypoint" aria-hidden="true">◦</span>
      </a>
      <div className="mobile-bar__actions">
        <ThemeToggle theme={theme} onToggle={onToggle} />
        <button
          type="button"
          className="mobile-bar__menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-sheet"
          onClick={onMenu}
        >
          <span className={`hamburger${menuOpen ? " is-open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  );
}
