import { motion } from "framer-motion";

export function Token({ color, label }: { color: string; label: string }) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="size-5 rounded-full grid place-items-center font-mono text-[8px] font-bold border-2 border-white/80 shadow-lg"
      style={{ background: color, color: "#050507", boxShadow: `0 0 10px ${color}` }}
      aria-label={label}
    >
      {label.slice(0, 1).toUpperCase()}
    </motion.div>
  );
}
