import "./common.css";

export default function Section({ id, children, className = "", ...rest }) {
  return (
    <section id={id} className={`section ${className}`} {...rest}>
      <div className="container">{children}</div>
    </section>
  );
}
