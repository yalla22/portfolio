import { profile } from "../../data/profile.js";
import "./common.css";

export default function CoordReadout() {
  const { coords } = profile;
  return (
    <div className="coord-readout" aria-hidden="true">
      <span className="dot" />
      <span>
        {coords.label} · {coords.lat}, {coords.lng}
      </span>
    </div>
  );
}
