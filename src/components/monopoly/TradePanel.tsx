import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, X } from "lucide-react";
import { BOARD, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyState, TradeOffer } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";

function PropPicker({
  state,
  playerId,
  selected,
  onToggle,
}: {
  state: MonopolyState;
  playerId: string;
  selected: number[];
  onToggle: (i: number) => void;
}) {
  const tiles = Object.entries(state.properties)
    .filter(([, p]) => p.ownerId === playerId)
    .map(([i]) => +i);
  if (tiles.length === 0) {
    return <div className="text-[10px] font-mono text-white/30">No properties.</div>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {tiles.map((i) => {
        const t = BOARD[i];
        const color = t.group ? GROUP_COLORS[t.group] : "#666";
        const on = selected.includes(i);
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            className="text-[9px] font-mono px-1.5 py-1"
            style={{
              background: on ? color : `${color}20`,
              color: on ? "#000" : color,
              border: `1px solid ${color}`,
            }}
          >
            {t.name}
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
  existingOffer?: TradeOffer | null;
  onClose: () => void;
  onPropose?: (offer: Omit<TradeOffer, "id" | "status">) => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function TradePanel({
  state,
  meId,
  partnerId,
  existingOffer,
  onClose,
  onPropose,
  onAccept,
  onDecline,
}: Props) {
  const me = state.players.find((p) => p.id === meId)!;
  const partner = state.players.find((p) => p.id === partnerId)!;

  const [myProps, setMyProps] = useState<number[]>(existingOffer?.fromProps ?? []);
  const [theirProps, setTheirProps] = useState<number[]>(existingOffer?.toProps ?? []);
  const [myCash, setMyCash] = useState(existingOffer?.fromCash ?? 0);
  const [theirCash, setTheirCash] = useState(existingOffer?.toCash ?? 0);

  const isReview = !!existingOffer;

  const toggle = (set: typeof setMyProps, arr: number[]) => (i: number) =>
    set(arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]);

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
          <button onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <section>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-2">
              You give ({me.username})
            </div>
            <PropPicker
              state={state}
              playerId={meId}
              selected={myProps}
              onToggle={toggle(setMyProps, myProps)}
            />
            <label className="block mt-3 text-[10px] font-mono uppercase">Cash (₹)</label>
            <input
              type="number"
              min={0}
              max={me.cash}
              value={myCash}
              onChange={(e) => setMyCash(+e.target.value)}
              disabled={isReview}
              className="w-full bg-black/40 border border-white/20 px-2 py-1 font-mono text-accent-amber"
            />
          </section>
          <section>
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-pink mb-2">
              You get ({partner.username})
            </div>
            <PropPicker
              state={state}
              playerId={partnerId}
              selected={theirProps}
              onToggle={toggle(setTheirProps, theirProps)}
            />
            <label className="block mt-3 text-[10px] font-mono uppercase">Cash (₹)</label>
            <input
              type="number"
              min={0}
              max={partner.cash}
              value={theirCash}
              onChange={(e) => setTheirCash(+e.target.value)}
              disabled={isReview}
              className="w-full bg-black/40 border border-white/20 px-2 py-1 font-mono text-accent-amber"
            />
          </section>
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          {isReview ? (
            <>
              <NeonButton variant="ghost" size="sm" onClick={onDecline}>
                Decline
              </NeonButton>
              <NeonButton variant="cyan" size="sm" onClick={onAccept}>
                Accept
              </NeonButton>
            </>
          ) : (
            <NeonButton
              variant="cyan"
              onClick={() =>
                onPropose?.({
                  fromId: meId,
                  toId: partnerId,
                  fromProps: myProps,
                  toProps: theirProps,
                  fromCash: myCash,
                  toCash: theirCash,
                  fromJailCards: 0,
                  toJailCards: 0,
                })
              }
            >
              Send Offer
            </NeonButton>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
