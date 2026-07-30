import Tag from "../common/Tag.jsx";
import "./work.css";

export default function TechTags({ tech, max = 5 }) {
  const shown = max ? tech.slice(0, max) : tech;
  const extra = tech.length - shown.length;
  return (
    <div className="tech-tags">
      {shown.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
      {extra > 0 && <Tag>+{extra}</Tag>}
    </div>
  );
}
