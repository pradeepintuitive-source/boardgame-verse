import { motion } from "framer-motion";

/** Fan offsets so multiple tokens on one tile stay visually separate. */
const OFFSETS = [
  { x: 0, y: 0 },
  { x: 7, y: -4 },
  { x: -7, y: -4 },
  { x: 0, y: -10 },
  { x: 10, y: 2 },
  { x: -10, y: 2 },
];

export function Token({
  color,
  label,
  stackIndex = 0,
  emphasized = false,
  seatNumber,
}: {
  color: string;
  label: string;
  stackIndex?: number;
  emphasized?: boolean;
  /** 1-based seat for clear multiplayer identity */
  seatNumber?: number;
}) {
  const offset = OFFSETS[stackIndex % OFFSETS.length] ?? OFFSETS[0];
  const initial = label.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={`relative rounded-full grid place-items-center font-mono font-bold border-2 border-white/90 shadow-lg ${
        emphasized ? "size-7 text-[10px] z-20 ring-2 ring-white" : "size-5 text-[8px] z-10"
      }`}
      style={{
        background: color,
        color: "#050507",
        boxShadow: emphasized ? `0 0 16px ${color}, 0 0 4px #fff` : `0 0 10px ${color}`,
        marginLeft: offset.x,
        marginTop: offset.y,
      }}
      aria-label={label}
      title={seatNumber != null ? `${label} (#${seatNumber})` : label}
    >
      {initial}
      {seatNumber != null ? (
        <span
          className="absolute -top-1 -right-1 size-3 rounded-full bg-black text-white grid place-items-center text-[7px] font-mono border border-white/50"
          style={{ color: "#fff" }}
        >
          {seatNumber}
        </span>
      ) : null}
    </motion.div>
  );
}
