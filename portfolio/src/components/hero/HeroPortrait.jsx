import { profile } from "../../data/profile.js";

/**
 * HeroPortrait — above-the-fold framed headshot.
 *
 * Mirrors the About ProfilePhoto frame idiom (corner tick + mono caption) but
 * is its own component so the hero owns its markup. Loads eagerly (above fold)
 * and degrades to a labelled placeholder if /profile.jpg is missing.
 *
 * Props: none. Image + caption come from profile.photo / profile.coords.label.
 */
export default function HeroPortrait() {
  return (
    <figure className="hero-portrait">
      <span className="hero-portrait__tick" aria-hidden="true" />
      <span
        className="hero-portrait__tick hero-portrait__tick--br"
        aria-hidden="true"
      />
      <img
        src={profile.photo}
        alt={`Portrait of ${profile.name}`}
        loading="eager"
        decoding="async"
        width="320"
        height="400"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement.classList.add("is-placeholder");
        }}
      />
      <figcaption className="hero-portrait__caption mono">
        {profile.coords.label}
      </figcaption>
    </figure>
  );
}
