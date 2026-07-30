import { profile } from "../../data/profile.js";
import "./about.css";

export default function ProfilePhoto() {
  return (
    <figure className="profile-photo">
      <span className="profile-photo__tick" aria-hidden="true" />
      <img
        src={profile.photo}
        alt={`Portrait of ${profile.name}`}
        loading="lazy"
        width="320"
        height="400"
        onError={(e) => {
          // Graceful placeholder if /profile.jpg is not yet added.
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement.classList.add("is-placeholder");
        }}
      />
      <figcaption className="profile-photo__caption mono">
        {profile.coords.label}
      </figcaption>
    </figure>
  );
}
