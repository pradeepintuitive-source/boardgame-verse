import { useState } from "react";
import { motion } from "framer-motion";
import { Banknote, X, ArrowRight } from "lucide-react";
import type { MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";

interface Props {
  state: MonopolyState;
  onClose: () => void;
  onAdjust: (playerId: string, delta: number) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const QUICK = [50, 100, 200, 500];

export function BankManager({ state, onClose, onAdjust, onTransfer }: Props) {
  const players = state.players.filter((p) => !p.bankrupt);
  const [fromId, setFromId] = useState(players[0]?.id ?? "");
  const [toId, setToId] = useState(players[1]?.id ?? players[0]?.id ?? "");
  const [amount, setAmount] = useState(100);
  const [customDelta, setCustomDelta] = useState<Record<string, number>>({});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel border border-accent-amber/40 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Banknote className="size-6 text-accent-amber" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-amber">
                Bank Manager
              </div>
              <h2 className="font-display text-2xl italic uppercase">Cash Control</h2>
            </div>
          </div>
          <button onClick={onClose} className="size-8 grid place-items-center hover:text-accent-pink">
            <X className="size-5" />
          </button>
        </div>

        <p className="text-[11px] font-mono text-white/50 mb-4 leading-relaxed">
          Pay players from the bank (+), collect to the bank (−), or transfer between players. Use this
          for house rules, mistakes, or local pass-and-play adjustments.
        </p>

        <div className="space-y-2 mb-6">
          {players.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_auto_auto] gap-3 items-center bg-black/30 border border-white/10 p-3"
            >
              <div>
                <div className="font-bold text-sm" style={{ color: p.avatarColor }}>
                  {p.username}
                </div>
                <div className="font-mono text-xs text-accent-amber">${p.cash}</div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {QUICK.map((q) => (
                  <button
                    key={`m${q}`}
                    onClick={() => onAdjust(p.id, -q)}
                    className="px-2 py-1 border border-accent-pink/40 hover:bg-accent-pink/20 font-mono text-[10px] text-accent-pink"
                  >
                    −${q}
                  </button>
                ))}
                {QUICK.map((q) => (
                  <button
                    key={`p${q}`}
                    onClick={() => onAdjust(p.id, q)}
                    className="px-2 py-1 border border-accent-cyan/40 hover:bg-accent-cyan/20 font-mono text-[10px] text-accent-cyan"
                  >
                    +${q}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={customDelta[p.id] ?? ""}
                  placeholder="amt"
                  onChange={(e) =>
                    setCustomDelta({ ...customDelta, [p.id]: +e.target.value })
                  }
                  className="w-20 bg-black/40 border border-white/20 px-2 py-1 font-mono text-xs"
                />
                <button
                  onClick={() => {
                    const v = customDelta[p.id] || 0;
                    if (v) onAdjust(p.id, v);
                  }}
                  className="px-2 py-1 border border-white/30 hover:border-accent-amber font-mono text-[10px]"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-3">
            Player → Player Transfer
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_auto] gap-2 items-center">
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="bg-black/40 border border-white/20 px-2 py-2 font-mono text-xs"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.username} (${p.cash})
                </option>
              ))}
            </select>
            <ArrowRight className="size-4 text-white/40" />
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="bg-black/40 border border-white/20 px-2 py-2 font-mono text-xs"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.username}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              className="w-24 bg-black/40 border border-white/20 px-2 py-2 font-mono text-xs"
            />
            <NeonButton
              size="sm"
              variant="cyan"
              onClick={() => {
                if (amount > 0) onTransfer(fromId, toId, amount);
              }}
            >
              Send
            </NeonButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}