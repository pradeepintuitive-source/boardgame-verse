import { motion } from "framer-motion";
import type { DiceRoll } from "../../models/monopoly";

function Pip({ on }: { on: boolean }) {
  return (
    <div
      className={`size-2 rounded-full ${on ? "bg-black shadow-inner" : "bg-transparent"}`}
      style={on ? { boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" } : {}}
    />
  );
}

const PIP_MAP: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

function Die({ value, spinKey }: { value: number; spinKey: number }) {
  return (
    <motion.div
      key={spinKey + ":" + value}
      initial={{ rotate: -180, scale: 0.5, y: -20, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.5,
      }}
      className="size-12 bg-white rounded-md grid grid-cols-3 grid-rows-3 p-1.5 gap-0.5"
      style={{
        boxShadow:
          "0 8px 16px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)",
      }}
    >
      {PIP_MAP[value].map((on, i) => (
        <Pip key={i} on={on} />
      ))}
    </motion.div>
  );
}

export function Dice({ roll }: { roll: DiceRoll | null }) {
  if (!roll) {
    return (
      <div className="flex gap-3">
        <div className="size-12 border-2 border-dashed border-[rgba(212,168,67,0.2)] rounded-md opacity-50" />
        <div className="size-12 border-2 border-dashed border-[rgba(212,168,67,0.2)] rounded-md opacity-50" />
      </div>
    );
  }
  return (
    <div className="flex gap-4 items-center">
      <div className="flex gap-3">
        <Die value={roll.d1} spinKey={roll.rolledAt} />
        <Die value={roll.d2} spinKey={roll.rolledAt + 1} />
      </div>
      {roll.isDouble && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded-sm"
          style={{ background: "rgba(212,168,67,0.15)", color: "#d4a843" }}
        >
          Double!
        </motion.span>
      )}
    </div>
  );
}
