import { motion } from "framer-motion";
import { Sparkles, Boxes } from "lucide-react";
import { NeonButton } from "../common/NeonButton";

export type CardReveal = {
  deck: "chance" | "chest";
  text: string;
};

export function CardRevealModal({
  card,
  onContinue,
}: {
  card: CardReveal;
  onContinue: () => void;
}) {
  const isChance = card.deck === "chance";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className={`glass-panel border p-8 max-w-md w-full text-center ${
          isChance ? "border-accent-pink/50" : "border-accent-cyan/50"
        }`}
      >
        {isChance ? (
          <Sparkles className="size-10 text-accent-pink mx-auto mb-3" />
        ) : (
          <Boxes className="size-10 text-accent-cyan mx-auto mb-3" />
        )}
        <div
          className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-2 ${
            isChance ? "text-accent-pink" : "text-accent-cyan"
          }`}
        >
          {isChance ? "Chance" : "Community Chest"}
        </div>
        <h2 className="font-display text-3xl italic uppercase mb-4">Card Drawn</h2>
        <p className="text-sm font-mono text-white/80 leading-relaxed mb-6">{card.text}</p>
        <NeonButton variant="cyan" className="w-full" onClick={onContinue}>
          Continue
        </NeonButton>
        <p className="mt-4 text-[10px] font-mono text-white/40 leading-relaxed">
          Cards are drawn at random when you land on Chance or Community Chest and apply at once.
        </p>
      </motion.div>
    </motion.div>
  );
}

/** Parse backend log lines like `Card (CHANCE|CHEST): …` */
export function parseCardLogLine(text: string): CardReveal | null {
  const match = text.match(/^Card\s*\((CHANCE|CHEST)\)\s*:\s*(.+)$/i);
  if (!match) return null;
  return {
    deck: match[1].toUpperCase() === "CHANCE" ? "chance" : "chest",
    text: match[2].trim(),
  };
}
