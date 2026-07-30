import { FILTERS } from "../../data/projects.js";
import "./work.css";

export default function FilterChips({ active, onChange, shown, total }) {
  return (
    <div className="filter-row">
      <div
        className="filter-chips"
        role="group"
        aria-label="Filter projects by category"
      >
        {FILTERS.map((f) => {
          const isActive = f === active;
          return (
            <button
              key={f}
              type="button"
              className={`chip${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onChange(f)}
            >
              {f}
            </button>
          );
        })}
      </div>
      <span className="filter-count mono" aria-live="polite">
        {shown} / {total} SHOWN
      </span>
    </div>
  );
}
