import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, X } from "lucide-react";
import { BOARD, GROUP_COLORS, shortTileName } from "../../data/monopolyBoard";
import type { MonopolyState, TradeOffer } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { formatInr } from "../../utils/monopolyEngine";

function PropPicker({
  state,
  playerId,
  selected,
  onSelect,
}: {
  state: MonopolyState;
  playerId: string;
  selected: number | null;
  onSelect: (i: number | null) => void;
}) {
  const tiles = Object.entries(state.properties)
    .filter(([, p]) => p.ownerId === playerId)
    .map(([i]) => +i);
  if (tiles.length === 0) {
    return <div className="text-[10px] font-mono text-white/30">No properties.</div>;
  }
  return (
    <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
      {tiles.map((i) => {
        const t = BOARD[i];
        const color = t.group ? GROUP_COLORS[t.group] : "#666";
        const on = selected === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(on ? null : i)}
            className="text-[10px] font-mono px-2 py-1"
            style={{
              background: on ? color : `${color}20`,
              color: on ? "#000" : color,
              border: `1px solid ${color}`,
            }}
            title={t.name}
          >
            {shortTileName(t)}
          </button>
        );
      })}
    </div>
  );
}

interface Props {
  state: MonopolyState;
  meId: string;
  partnerId: string;
  onClose: () => void;
  onPropose?: (offer: Omit<TradeOffer, "id" | "status">) => void;
}

export function TradePanel({ state, meId, partnerId, onClose, onPropose }: Props) {
  const me = state.players.find((p) => p.id === meId)!;
  const partner = state.players.find((p) => p.id === partnerId)!;

  const [myProp, setMyProp] = useState<number | null>(null);
  const [theirProp, setTheirProp] = useState<number | null>(null);
  const [myCash, setMyCash] = useState(0);

  const canConfirm = myProp != null && theirProp != null && myCash >= 0 && myCash <= me.cash;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel border border-accent-cyan/40 p-6 max-w-2xl w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl italic uppercase">
            Trade <ArrowLeftRight className="inline size-5 mx-2" /> {partner.username}
          </h3>
          <button type="button" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        <p className="text-[11px] font-mono text-white/45 mb-4">
          Swap one property each way. Optional cash you pay them. Executes immediately on your turn.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <section>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-2">
              You give ({me.username})
            </div>
            <PropPicker state={state} playerId={meId} selected={myProp} onSelect={setMyProp} />
            <label className="block mt-3 text-[10px] font-mono uppercase">Cash you pay (₹)</label>
            <input
              type="number"
              min={0}
              max={me.cash}
              value={myCash}
              onChange={(e) => setMyCash(Math.max(0, Math.min(me.cash, +e.target.value || 0)))}
              className="w-full bg-black/40 border border-white/20 px-2 py-1 font-mono text-accent-amber"
            />
            <div className="text-[10px] font-mono text-white/40 mt-1">Your cash {formatInr(me.cash)}</div>
          </section>
          <section>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-pink mb-2">
              You get ({partner.username})
            </div>
            <PropPicker
              state={state}
              playerId={partnerId}
              selected={theirProp}
              onSelect={setTheirProp}
            />
          </section>
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          <NeonButton variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </NeonButton>
          <NeonButton
            variant="cyan"
            disabled={!canConfirm}
            onClick={() =>
              onPropose?.({
                fromId: meId,
                toId: partnerId,
                fromProps: myProp != null ? [myProp] : [],
                toProps: theirProp != null ? [theirProp] : [],
                fromCash: myCash,
                toCash: 0,
                fromJailCards: 0,
                toJailCards: 0,
              })
            }
          >
            Confirm Trade
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
