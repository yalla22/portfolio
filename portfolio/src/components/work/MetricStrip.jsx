import "./work.css";

export default function MetricStrip({ metrics }) {
  return (
    <ul className="metric-strip" aria-label="Key metrics">
      {metrics.map((m, i) => (
        <li key={i} className="metric-strip__item">
          {m}
        </li>
      ))}
    </ul>
  );
}
