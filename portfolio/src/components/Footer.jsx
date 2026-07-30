import { profile, socials } from "../data/profile.js";
import Icon from "./common/Icon.jsx";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__contour" aria-hidden="true">
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none">
          <g fill="none" stroke="var(--contour)" strokeWidth="1.5">
            <path d="M0 40 Q 250 10 500 40 T 1000 40" />
            <path d="M0 70 Q 250 40 500 70 T 1000 70" />
            <path d="M0 100 Q 250 70 500 100 T 1000 100" />
          </g>
        </svg>
      </div>
      <div className="container footer__inner">
        <p className="mono footer__line">
          © 2026 · {profile.name} · Built with React + Vite ·{" "}
          {profile.location} · Open to roles · Immediate joiner
        </p>
        <div className="footer__links">
          <a href={`mailto:${profile.email}`} className="footer__email mono">
            {profile.email}
          </a>
          <div className="footer__socials">
            {socials
              .filter((s) => s.icon !== "mail")
              .map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                >
                  <Icon name={s.icon} size={16} />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
