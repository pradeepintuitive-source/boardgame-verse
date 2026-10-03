import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DiceRoll } from "../../models/monopoly";

function Pip({ on }: { on: boolean }) {
  return <div className={`size-1.5 rounded-full ${on ? "bg-black" : "bg-transparent"}`} />;
}

const PIP_MAP: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

function Die({
  value,
  spinning,
  compact,
}: {
  value: number;
  spinning: boolean;
  compact?: boolean;
}) {
  return (
    <motion.div
      animate={spinning ? { rotate: [0, 360], scale: [0.65, 1.05, 1] } : { rotate: 0, scale: 1 }}
      transition={spinning ? { duration: 0.55, ease: "easeOut" } : { duration: 0 }}
      className={`${compact ? "size-6" : "size-8 sm:size-9"} bg-white rounded-md grid grid-cols-3 grid-rows-3 ${
        compact ? "p-1 gap-px" : "p-1.5 gap-0.5"
      } shadow-[0_0_16px_rgba(0,242,255,0.45)]`}
    >
      {(PIP_MAP[value] ?? PIP_MAP[1]).map((on, i) => (
        <Pip key={i} on={on} />
      ))}
    </motion.div>
  );
}

/** Animates only when a new roll timestamp arrives (actual ROLL_DICE), not on remaps/turn change. */
export function Dice({ roll, compact = false }: { roll: DiceRoll | null; compact?: boolean }) {
  const prevRolledAt = useRef<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!roll) {
      prevRolledAt.current = null;
      setSpinning(false);
      return;
    }
    if (prevRolledAt.current !== roll.rolledAt) {
      prevRolledAt.current = roll.rolledAt;
      setSpinning(true);
      const t = window.setTimeout(() => setSpinning(false), 600);
      return () => window.clearTimeout(t);
    }
  }, [roll?.rolledAt, roll]);

  if (!roll) {
    return (
      <div className={`flex ${compact ? "gap-1" : "gap-2"}`}>
        <div
          className={`${compact ? "size-6" : "size-8 sm:size-9"} border-2 border-dashed border-white/20 rounded-md`}
        />
        <div
          className={`${compact ? "size-6" : "size-8 sm:size-9"} border-2 border-dashed border-white/20 rounded-md`}
        />
      </div>
    );
  }

  return (
    <div className={`flex ${compact ? "gap-1" : "gap-2"} items-center`}>
      <Die value={roll.d1} spinning={spinning} compact={compact} />
      <Die value={roll.d2} spinning={spinning} compact={compact} />
      {roll.isDouble && (
        <span
          className={`${compact ? "text-[7px]" : "text-[9px]"} font-mono uppercase tracking-widest text-accent-amber`}
        >
          DOUBLE!
        </span>
      )}
    </div>
  );
}
