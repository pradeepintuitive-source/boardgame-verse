import type { Variants } from "framer-motion";

export const pageFade: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
};

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -8, scale: 1.01, transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] } },
};
