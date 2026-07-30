import { useState } from "react";
import { profile } from "../../data/profile.js";
import Icon from "../common/Icon.jsx";
import "./contact.css";

// "github.com/handle" style label derived from the real profile URL.
function urlLabel(url) {
  try {
    const u = new URL(url);
    return `${u.host.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

export default function ContactLinks() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const items = [
    {
      id: "email",
      icon: "mail",
      label: "Email",
      value: profile.email,
      action: "copy",
    },
    {
      id: "phone",
      icon: "phone",
      label: "Phone",
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s/g, "")}`,
    },
    {
      id: "github",
      icon: "github",
      label: "GitHub",
      value: urlLabel(profile.github),
      href: profile.github,
      external: true,
    },
    {
      id: "linkedin",
      icon: "linkedin",
      label: "LinkedIn",
      value: urlLabel(profile.linkedin),
      href: profile.linkedin,
      external: true,
    },
  ];

  return (
    <ul className="contact-links">
      {items.map((it) => {
        const inner = (
          <>
            <span className="contact-links__icon">
              <Icon name={it.icon} size={18} />
            </span>
            <span className="contact-links__text">
              <span className="mono-label contact-links__label">
                {it.action === "copy" && copied ? "Copied ✓" : it.label}
              </span>
              <span className="contact-links__value">{it.value}</span>
            </span>
            <span className="contact-links__chev" aria-hidden="true">
              <Icon name={it.action === "copy" ? "filter" : "arrow-up-right"} size={14} />
            </span>
          </>
        );

        if (it.action === "copy") {
          return (
            <li key={it.id}>
              <button
                type="button"
                className="contact-links__row"
                onClick={copyEmail}
                aria-label={`Copy email address ${it.value}`}
              >
                {inner}
              </button>
            </li>
          );
        }
        return (
          <li key={it.id}>
            <a
              className="contact-links__row"
              href={it.href}
              target={it.external ? "_blank" : undefined}
              rel={it.external ? "noreferrer noopener" : undefined}
            >
              {inner}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
