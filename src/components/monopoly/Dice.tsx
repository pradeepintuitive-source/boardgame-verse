import { motion } from "framer-motion";
import type { DiceRoll } from "../../models/monopoly";

function Pip({ on }: { on: boolean }) {
  return (
    <div className={`size-1.5 rounded-full ${on ? "bg-black" : "bg-transparent"}`} />
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
      initial={{ rotate: 0, scale: 0.6 }}
      animate={{ rotate: 360, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="size-10 bg-white rounded-md grid grid-cols-3 grid-rows-3 p-1.5 gap-0.5 shadow-[0_0_20px_rgba(0,242,255,0.5)]"
    >
      {PIP_MAP[value].map((on, i) => <Pip key={i} on={on} />)}
    </motion.div>
  );
}

export function Dice({ roll }: { roll: DiceRoll | null }) {
  if (!roll) {
    return (
      <div className="flex gap-3">
        <div className="size-10 border-2 border-dashed border-white/20 rounded-md" />
        <div className="size-10 border-2 border-dashed border-white/20 rounded-md" />
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-center">
      <Die value={roll.d1} spinKey={roll.rolledAt} />
      <Die value={roll.d2} spinKey={roll.rolledAt + 1} />
      {roll.isDouble && (
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent-amber">
          DOUBLE!
        </span>
      )}
    </div>
  );
}