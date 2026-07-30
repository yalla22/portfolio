import { useState } from "react";
import PlaceholderVisual from "./PlaceholderVisual.jsx";
import "./work.css";

// One gallery tile: shows the real screenshot if it loads, otherwise falls back
// to a themed SVG placeholder with a "REPLACE → <src>" badge so the owner knows
// exactly which file to drop in.
function GalleryItem({ item }) {
  const [failed, setFailed] = useState(!item.src);

  return (
    <figure className="case-gallery__item">
      {!failed && (
        <img
          className="case-gallery__img"
          src={item.src}
          alt={item.alt || ""}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <PlaceholderVisual kind={item.placeholder || "ortho"} label={item.src} />
      )}
      {item.alt && <figcaption className="case-gallery__cap">{item.alt}</figcaption>}
    </figure>
  );
}

// CaseStudyGallery — grid of project screenshots (2-up desktop, 1-up mobile).
//
// Props:
//   gallery: Array<{ src: string, alt?: string, placeholder?: string }>
export default function CaseStudyGallery({ gallery }) {
  if (!gallery || !gallery.length) return null;
  return (
    <div className="case-gallery">
      {gallery.map((item, i) => (
        <GalleryItem key={item.src || i} item={item} />
      ))}
    </div>
  );
}
