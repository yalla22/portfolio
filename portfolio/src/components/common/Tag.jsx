import "./common.css";

export default function Tag({ children, accent = false }) {
  return <span className={`tag${accent ? " tag--accent" : ""}`}>{children}</span>;
}
