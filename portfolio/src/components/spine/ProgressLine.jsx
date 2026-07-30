import "./spine.css";

// Altitude gauge — vertical accent line filling with scroll progress.
export default function ProgressLine({ progress }) {
  return (
    <div className="progress-line" aria-hidden="true">
      <span
        className="progress-line__fill"
        style={{ transform: `scaleY(${progress})` }}
      />
    </div>
  );
}
