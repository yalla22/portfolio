import Icon from "../common/Icon.jsx";
import { profile } from "../../data/profile.js";

/**
 * HeroContactRow — contact surfaced at the TOP of the page.
 *
 * Compact mono pills (Email / Phone / GitHub / LinkedIn / Résumé) directly
 * under the hero CTAs so a recruiter can reach out without scrolling.
 *
 * Props: none. All targets read from `profile`. External links open in a new
 * tab; mail/tel use their schemes.
 */
const links = [
  { id: "mail", label: "Email", href: `mailto:${profile.email}`, icon: "mail" },
  { id: "phone", label: "Call", href: `tel:${profile.phone.replace(/\s+/g, "")}`, icon: "phone" },
  { id: "github", label: "GitHub", href: profile.github, icon: "github", external: true },
  { id: "linkedin", label: "LinkedIn", href: profile.linkedin, icon: "linkedin", external: true },
  { id: "resume", label: "Résumé", href: profile.resume, icon: "download", external: true },
];

export default function HeroContactRow() {
  return (
    <ul className="hero-contact-row" aria-label="Contact">
      {links.map((l) => (
        <li key={l.id}>
          <a
            className="hero-contact-pill"
            href={l.href}
            {...(l.external
              ? { target: "_blank", rel: "noreferrer noopener" }
              : {})}
            aria-label={l.label}
          >
            <Icon name={l.icon} size={15} />
            <span>{l.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
