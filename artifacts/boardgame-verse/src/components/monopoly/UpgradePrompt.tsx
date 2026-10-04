import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { BOARD, DEVELOPMENT_LABELS, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { formatInr } from "../../utils/monopolyEngine";
import { NeonButton } from "../common/NeonButton";

interface Props {
  state: MonopolyState;
  tileIndex: number;
  cash: number;
  onUpgrade: () => void;
  onCancel: () => void;
}

export function UpgradePrompt({ state, tileIndex, cash, onUpgrade, onCancel }: Props) {
  const tile = BOARD[tileIndex];
  const houses = state.properties[tileIndex]?.houses ?? 0;
  const cost = tile?.housePrice ?? 0;
  const nextLabel = DEVELOPMENT_LABELS[Math.min(houses + 1, 5)];
  const canAfford = cash >= cost;
  const groupColor = tile?.group ? GROUP_COLORS[tile.group] : "#d4a843";

  if (!tile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Upgrade ${tile.name}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-md overflow-hidden border border-[rgba(212,168,67,0.28)] bg-[#12121a] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="h-1.5 w-full" style={{ background: groupColor }} />
        <div className="px-5 py-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843]">
            Landed on your city
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase text-white">{tile.name}</h2>
          <p className="mt-2 text-sm text-[#9baab8]">
            Upgrade to {nextLabel} for {formatInr(cost)}. Skip to pass the turn.
          </p>
          {!canAfford && (
            <p className="mt-2 text-xs font-mono text-[#e05060]">
              Insufficient funds. You have {formatInr(cash)}.
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <NeonButton
              variant="gold"
              size="sm"
              className="flex-1"
              onClick={onUpgrade}
              disabled={!canAfford}
              icon={<TrendingUp className="size-4" />}
            >
              Upgrade
            </NeonButton>
            <NeonButton variant="ghost" size="sm" className="flex-1" onClick={onCancel}>
              Skip
            </NeonButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
