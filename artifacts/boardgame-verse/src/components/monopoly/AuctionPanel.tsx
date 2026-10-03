import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Timer } from "lucide-react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { formatInr } from "../../utils/monopolyEngine";

const QUICK_RAISES = [500, 1000, 2000, 5000];

export function AuctionPanel({
  state,
  meId,
  onBid,
  onPass,
}: {
  state: MonopolyState;
  meId: string;
  onBid: (amount: number) => void;
  onPass: () => void;
}) {
  const a = state.auction;
  const [bidAmount, setBidAmount] = useState(0);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    setSeconds(60);
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [a?.startedAt]);

  if (!a) return null;

  const tile = BOARD[a.tileIndex];
  const me = state.players.find((p) => p.id === meId) ?? state.players[0];
  const currentBidderId = a.activePlayerIds[a.currentBidderIndex] ?? a.activePlayerIds[0];
  const isMyBid =
    currentBidderId === meId && me && !me.bankrupt && a.activePlayerIds.includes(meId);
  const minBid = a.highestBid + 10;
  const effectiveBid = Math.max(minBid, bidAmount > 0 ? bidAmount : minBid);

  // Countdown ring
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const progress = seconds / 60;

  return (
    <AnimatePresence>
      {/* Right-side drawer — board stays visible behind */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[340px] flex flex-col"
        style={{
          background: "#12121a",
          borderLeft: "1px solid rgba(212,168,67,0.2)",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.7)",
        }}
        aria-label="Auction panel"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(212,168,67,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <Gavel className="size-5 text-[#d4a843]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843]">
              Live Auction
            </span>
          </div>
          {/* Countdown ring */}
          <div className="relative size-12 flex items-center justify-center">
            <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="rgba(212,168,67,0.12)"
                strokeWidth="3"
              />
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke={seconds < 10 ? "#8b2335" : "#d4a843"}
                strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span
              className={`text-[11px] font-mono font-bold z-10 ${seconds < 10 ? "text-[#e05060]" : "text-[#d4a843]"}`}
            >
              {seconds}s
            </span>
          </div>
        </div>

        {/* Property */}
        <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(212,168,67,0.08)" }}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1">
            Property
          </div>
          <div className="font-display text-2xl font-bold text-white leading-tight">
            {tile?.name}
          </div>
          <div className="text-xs font-mono text-[#9baab8] mt-0.5">
            List {formatInr(tile?.price ?? 0)}
          </div>
        </div>

        {/* Highest bid */}
        <div
          className="px-5 py-4 text-center"
          style={{ borderBottom: "1px solid rgba(212,168,67,0.08)" }}
        >
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#9baab8] mb-1">
            Highest Bid
          </div>
          <div className="font-display text-4xl font-bold" style={{ color: "#d4a843" }}>
            {formatInr(a.highestBid)}
          </div>
          {a.highestBidderId && (
            <div className="text-xs font-mono text-white/60 mt-1">
              by {state.players.find((p) => p.id === a.highestBidderId)?.username ?? "—"}
            </div>
          )}
        </div>

        {/* Bidder rows */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#9baab8] mb-2 flex items-center gap-1">
            <Timer className="size-3" /> Bidders
          </div>
          {a.activePlayerIds.map((bid) => {
            const pl = state.players.find((p) => p.id === bid);
            if (!pl) return null;
            const canBid = pl.cash >= minBid;
            const isCurrent = bid === currentBidderId;
            return (
              <div
                key={bid}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm",
                  isCurrent
                    ? "border border-[rgba(212,168,67,0.35)] bg-[#1a1508]"
                    : "border border-[rgba(255,255,255,0.05)] bg-[#0d0d12]",
                  !canBid ? "opacity-40" : "",
                ].join(" ")}
              >
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ background: pl.avatarColor }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold truncate ${isCurrent ? "text-[#d4a843]" : "text-white/80"}`}
                  >
                    {pl.username} {bid === meId ? "(you)" : ""}
                  </div>
                  <div className="text-[9px] font-mono text-[#9baab8]">{formatInr(pl.cash)}</div>
                </div>
                {isCurrent && (
                  <div className="text-[9px] font-mono text-[#d4a843] shrink-0">Bidding</div>
                )}
                {!canBid && (
                  <div className="text-[9px] font-mono text-[#e05060] shrink-0">Can't afford</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bid controls — only when it's your turn */}
        {isMyBid ? (
          <div
            className="px-5 py-4 space-y-3"
            style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}
          >
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#9baab8]">
              Quick Raise (min: {formatInr(minBid)})
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_RAISES.map((raise) => (
                <button
                  key={raise}
                  onClick={() =>
                    setBidAmount((prev) => Math.max(minBid, (prev > 0 ? prev : minBid) + raise))
                  }
                  disabled={me!.cash < minBid + raise}
                  className="min-h-[44px] text-[10px] font-mono border border-[rgba(212,168,67,0.25)] text-[#d4a843] rounded-sm hover:bg-[rgba(212,168,67,0.1)] disabled:opacity-30 transition-colors"
                >
                  +{formatInr(raise)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <NeonButton
                variant="gold"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onBid(effectiveBid);
                  setBidAmount(0);
                }}
                disabled={me!.cash < minBid}
              >
                Bid {formatInr(effectiveBid)}
              </NeonButton>
              <NeonButton variant="ghost" size="sm" onClick={onPass}>
                Pass
              </NeonButton>
            </div>
          </div>
        ) : (
          <div
            className="px-5 py-4 text-center text-xs font-mono text-[#9baab8] animate-pulse"
            style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}
          >
            Waiting for {state.players.find((p) => p.id === currentBidderId)?.username ?? "bidder"}…
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
