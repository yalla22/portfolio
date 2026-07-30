// Shared Framer Motion variants.
export const EASE = [0.22, 1, 0.36, 1];

export const revealVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: i * 0.06 },
  }),
};

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export const tickSpring = { type: "spring", stiffness: 300, damping: 30 };

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};
