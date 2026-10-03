import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, X, Scale } from "lucide-react";
import { BOARD, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyState, TradeOffer } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { formatInr } from "../../utils/monopolyEngine";

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
    return <div className="text-[10px] font-mono text-white/30 italic">No properties.</div>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tiles.map((i) => {
        const t = BOARD[i];
        const color = t.group ? GROUP_COLORS[t.group] : "#666";
        const on = selected.includes(i);
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            className="min-h-[36px] text-[9px] font-sans font-semibold px-2 py-1 rounded-sm transition-all hover:scale-105"
            style={{
              background: on ? color : `${color}22`,
              color: on ? "#0d0d12" : color,
              border: `1px solid ${color}80`,
            }}
            title={t.name}
          >
            <span className="block leading-tight max-w-[52px] truncate">{t.name}</span>
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

  // Fairness: total value I offer vs. total value I receive
  const myOfferValue = myCash + myProps.reduce((acc, i) => acc + (BOARD[i].price ?? 0), 0);
  const theirOfferValue = theirCash + theirProps.reduce((acc, i) => acc + (BOARD[i].price ?? 0), 0);
  const fairnessDelta = myOfferValue - theirOfferValue;
  const fairnessLabel =
    Math.abs(fairnessDelta) < 500
      ? "Balanced"
      : fairnessDelta > 0
        ? `You overpay by ${formatInr(fairnessDelta)}`
        : `You gain ${formatInr(-fairnessDelta)}`;
  const fairnessColor =
    Math.abs(fairnessDelta) < 500 ? "#2a5f3f" : fairnessDelta > 0 ? "#8b2335" : "#d4a843";

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
      className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col overflow-hidden"
      style={{
        background: "#12121a",
        borderLeft: "1px solid rgba(212,168,67,0.2)",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.7)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Trade negotiation"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(212,168,67,0.12)" }}
      >
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="size-4 text-[#d4a843]" />
          <span className="font-display text-lg font-bold text-white">
            Trade with {partner.username}
          </span>
        </div>
        <button
          onClick={onClose}
          className="size-8 grid place-items-center hover:text-[#d4a843] transition-colors rounded-sm"
          aria-label="Close trade panel"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Two-column negotiation */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 divide-x divide-[rgba(212,168,67,0.08)]">
          {/* You give */}
          <div className="p-4 space-y-3">
            <div
              className="text-[9px] font-mono uppercase tracking-widest mb-2"
              style={{ color: "#d4a843" }}
            >
              {me.username} Offers
            </div>
            <div className="text-[10px] font-mono text-[#9baab8] mb-1">Properties</div>
            <PropPicker
              state={state}
              playerId={meId}
              selected={myProps}
              onToggle={toggle(setMyProps, myProps)}
            />
            <label className="block">
              <span className="text-[10px] font-mono text-[#9baab8] block mb-1">Cash (₹)</span>
              <input
                type="number"
                min={0}
                max={me.cash}
                value={myCash}
                onChange={(e) => setMyCash(+e.target.value)}
                disabled={isReview}
                className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-2 py-2 font-mono text-sm text-[#d4a843] rounded-sm focus:border-[#d4a843] outline-none min-h-[44px]"
              />
            </label>
          </div>

          {/* They give */}
          <div className="p-4 space-y-3">
            <div
              className="text-[9px] font-mono uppercase tracking-widest mb-2"
              style={{ color: "#9baab8" }}
            >
              {partner.username} Offers
            </div>
            <div className="text-[10px] font-mono text-[#9baab8] mb-1">Properties</div>
            <PropPicker
              state={state}
              playerId={partnerId}
              selected={theirProps}
              onToggle={toggle(setTheirProps, theirProps)}
            />
            <label className="block">
              <span className="text-[10px] font-mono text-[#9baab8] block mb-1">Cash (₹)</span>
              <input
                type="number"
                min={0}
                max={partner.cash}
                value={theirCash}
                onChange={(e) => setTheirCash(+e.target.value)}
                disabled={isReview}
                className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-2 py-2 font-mono text-sm text-[#d4a843] rounded-sm focus:border-[#d4a843] outline-none min-h-[44px]"
              />
            </label>
          </div>
        </div>

        {/* Fairness indicator */}
        <div
          className="mx-4 my-3 px-4 py-3 rounded-sm flex items-center gap-3"
          style={{ background: `${fairnessColor}15`, border: `1px solid ${fairnessColor}40` }}
        >
          <Scale className="size-4 shrink-0" style={{ color: fairnessColor }} />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
              Fairness
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: fairnessColor }}>
              {fairnessLabel}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] font-mono text-[#9baab8]">You offer</div>
            <div className="text-xs font-mono text-white">{formatInr(myOfferValue)}</div>
            <div className="text-[9px] font-mono text-[#9baab8] mt-1">You receive</div>
            <div className="text-xs font-mono text-white">{formatInr(theirOfferValue)}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="px-4 py-4 flex gap-2 flex-wrap shrink-0"
        style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}
      >
        {isReview ? (
          <>
            <NeonButton variant="danger" size="sm" onClick={onDecline} className="flex-1">
              Reject
            </NeonButton>
            <NeonButton variant="gold" size="sm" onClick={onAccept} className="flex-1">
              Accept
            </NeonButton>
          </>
        ) : (
          <>
            <NeonButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </NeonButton>
            <NeonButton
              variant="gold"
              size="sm"
              className="flex-1"
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
              Propose Trade
            </NeonButton>
          </>
        )}
      </div>
    </motion.div>
  );
}
