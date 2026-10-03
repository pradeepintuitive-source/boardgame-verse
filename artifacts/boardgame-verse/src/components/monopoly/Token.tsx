import { motion } from "framer-motion";

const SHAPES = [
  // Pentagon (Player 0)
  (color: string, initial: string) => (
    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
      <polygon
        points="20,3 37,14 31,34 9,34 3,14"
        fill={color}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill="#fff"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
    </svg>
  ),
  // Diamond (Player 1)
  (color: string, initial: string) => (
    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
      <polygon
        points="20,3 37,20 20,37 3,20"
        fill={color}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="#fff"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
    </svg>
  ),
  // Hexagon (Player 2)
  (color: string, initial: string) => (
    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
      <polygon
        points="20,3 34,11 34,29 20,37 6,29 6,11"
        fill={color}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="#fff"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
    </svg>
  ),
  // Shield (Player 3)
  (color: string, initial: string) => (
    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
      <path
        d="M20,3 L36,10 L36,24 C36,31 20,37 20,37 C20,37 4,31 4,24 L4,10 Z"
        fill={color}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="#fff"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
    </svg>
  ),
  // Star (Player 4)
  (color: string, initial: string) => (
    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
      <polygon
        points="20,3 24,15 37,15 27,23 31,36 20,28 9,36 13,23 3,15 16,15"
        fill={color}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fill="#fff"
        fontSize="11"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
    </svg>
  ),
  // Circle (Player 5)
  (color: string, initial: string) => (
    <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
      <circle
        cx="20"
        cy="20"
        r="17"
        fill={color}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="#fff"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {initial}
      </text>
    </svg>
  ),
];

interface TokenProps {
  color: string;
  label: string;
  /** Which player slot index (0-5) determines shape */
  playerIndex?: number;
  size?: "sm" | "md" | "lg";
  isCurrent?: boolean;
}

export function Token({
  color,
  label,
  playerIndex = 0,
  size = "sm",
  isCurrent = false,
}: TokenProps) {
  const shapeIndex = playerIndex % SHAPES.length;
  const ShapeFn = SHAPES[shapeIndex];
  const initial = label.slice(0, 1).toUpperCase();

  const sizeClass = size === "lg" ? "size-9" : size === "md" ? "size-7" : "size-5";

  return (
    <motion.div
      layout
      whileHover={{ y: -3, scale: 1.15 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`${sizeClass} relative flex-shrink-0 ${isCurrent ? "token-bounce" : ""}`}
      aria-label={label}
      title={label}
      style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
    >
      {ShapeFn(color, initial)}
    </motion.div>
  );
}
