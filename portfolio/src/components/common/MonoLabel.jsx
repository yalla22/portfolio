import "./common.css";

export default function MonoLabel({ children, as: Tag = "span", className = "", ...rest }) {
  return (
    <Tag className={`mono-label ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
