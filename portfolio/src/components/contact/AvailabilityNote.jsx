import { profile } from "../../data/profile.js";
import "./contact.css";

export default function AvailabilityNote() {
  return (
    <div className="availability">
      <span className="availability__dot" aria-hidden="true" />
      <span className="mono availability__text">{profile.availability}</span>
    </div>
  );
}
