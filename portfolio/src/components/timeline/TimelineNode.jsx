import { motion } from "framer-motion";
import { useInView } from "../../lib/useInView.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { EASE } from "../../lib/motion.js";

/**
 * Self-contained kind glyphs so the Timeline renders complete regardless of
 * whether the shared Icon.jsx has been extended with graduation/cpu yet.
 * Keyed by the `icon` field on each experience record.
 */
const GLYPHS = {
  graduation: (
    <>
      <path d="M12 4 2 9l10 5 10-5-10-5z" />
      <path d="M6 11.5V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.5" />
      <path d="M22 9v5" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9 2v2M12 2v2M15 2v2M9 20v2M12 20v2M15 20v2M2 9h2M2 12h2M2 15h2M20 9h2M20 12h2M20 15h2" />
    </>
  ),
  drone: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M9.7 9.7 5 5M14.3 9.7 19 5M9.7 14.3 5 19M14.3 14.3 19 19" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </>
  ),
};

function KindGlyph({ name, size = 18 }) {
  const node = GLYPHS[name] || GLYPHS.cpu;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {node}
    </svg>
  );
}

const KIND_LABEL = {
  work: "WORK",
  education: "EDU",
  milestone: "PROJECT",
};

/**
 * TimelineNode
 * One entry on the vertical rail. Reveals on scroll (staggered), and
 * expands/highlights on hover or keyboard focus.
 *
 * Props:
 *   item   {object}  experience record { id, kind, icon, role, org, period, detail }
 *   index  {number}  position in the list (drives stagger delay + dot fill)
 *   last   {boolean} marks the final node (suppresses trailing connector spacing)
 */
export default function TimelineNode({ item, index = 0, last = false }) {
  const [ref, inView] = useInView({ threshold: 0.3, rootMargin: "0px 0px -12% 0px" });
  const reduced = useReducedMotion();
  const show = reduced || inView;

  // The node is non-interactive (all text is already visible) — the
  // hover/expand is purely decorative and driven by :hover in CSS, so it is not
  // a tab stop and the semantic <h3>/<p> content is read naturally by AT.
  return (
    <motion.li
      ref={ref}
      className={`tl-node${last ? " tl-node--last" : ""}`}
      data-kind={item.kind}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
      transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : index * 0.08 }}
    >
      <span className="tl-node__marker" aria-hidden="true">
        <span className="tl-node__dot">
          <KindGlyph name={item.icon} size={15} />
        </span>
      </span>

      <div className="tl-node__content">
        <div className="tl-node__head">
          <h3 className="tl-node__role">{item.role}</h3>
          <span className="mono tl-node__chip" data-kind={item.kind}>
            {KIND_LABEL[item.kind] || item.kind}
          </span>
        </div>
        <p className="tl-node__org">{item.org}</p>
        <span className="mono tl-node__period">{item.period}</span>
        <p className="tl-node__detail">{item.detail}</p>
      </div>
    </motion.li>
  );
}
