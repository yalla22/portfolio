import Button from "../common/Button.jsx";
import Icon from "../common/Icon.jsx";
import { profile } from "../../data/profile.js";

/**
 * CtaGroup — primary hero actions.
 *   View Work (smooth-scroll #work) · Download Résumé (download) · View Showcase (#showcase)
 * Props: none.
 */
export default function CtaGroup() {
  const smoothTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="hero__ctas">
      <Button as="a" href="#work" variant="filled" onClick={smoothTo("work")}>
        View Work
      </Button>
      <Button
        as="a"
        href={profile.resume}
        variant="outline"
        download
        target="_blank"
        rel="noreferrer noopener"
      >
        Download Résumé
        <Icon name="download" size={16} />
      </Button>
      <Button
        as="a"
        href="#showcase"
        variant="ghost"
        onClick={smoothTo("showcase")}
      >
        View Showcase
        <Icon name="arrow-up-right" size={16} />
      </Button>
    </div>
  );
}
