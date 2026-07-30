import { AnimatePresence, motion } from "framer-motion";
import ProjectCard from "./ProjectCard.jsx";
import "./work.css";

export default function ProjectGrid({ projects, total, onOpen }) {
  return (
    <motion.ul layout className="project-grid">
      <AnimatePresence mode="popLayout">
        {projects.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i}
            total={total}
            onOpen={onOpen}
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
