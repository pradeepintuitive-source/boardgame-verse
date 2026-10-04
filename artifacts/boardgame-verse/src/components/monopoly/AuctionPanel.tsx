import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Timer } from "lucide-react";
import { BOARD, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import {
  AUCTION_BID_STEP,
  AUCTION_TURN_SECONDS,
  formatInr,
  minAuctionBid,
  snapAuctionBid,
} from "../../utils/monopolyEngine";

const QUICK_RAISES = [100, 200, 500, 1000];

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
  const minBid = minAuctionBid(a?.highestBid ?? 0);
  const [bidAmount, setBidAmount] = useState(minBid);
  const [seconds, setSeconds] = useState(AUCTION_TURN_SECONDS);
  const timedOutRef = useRef(false);

  const currentBidderId = a?.activePlayerIds[a.currentBidderIndex] ?? a?.activePlayerIds[0];
  const mePlayer = state.players.find((p) => p.id === meId);
  const isMyBid = Boolean(
    a &&
      currentBidderId === meId &&
      mePlayer &&
      !mePlayer.bankrupt &&
      a.activePlayerIds.includes(meId),
  );

  useEffect(() => {
    setSeconds(AUCTION_TURN_SECONDS);
    timedOutRef.current = false;
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [a?.currentBidderIndex, a?.highestBid, a?.highestBidderId, a?.startedAt, a?.bids.length]);

  useEffect(() => {
    setBidAmount(minBid);
  }, [minBid]);

  useEffect(() => {
    if (seconds > 0 || !isMyBid || timedOutRef.current) return;
    timedOutRef.current = true;
    onPass();
  }, [seconds, isMyBid, onPass]);

  if (!a) return null;

  const tile = BOARD[a.tileIndex];
  const me = mePlayer ?? state.players[0];
  const groupColor = tile?.group ? GROUP_COLORS[tile.group] : "#d4a843";
  const maxBid = Math.floor((me?.cash ?? 0) / AUCTION_BID_STEP) * AUCTION_BID_STEP;
  const effectiveBid = Math.min(maxBid, snapAuctionBid(bidAmount || minBid, minBid));
  const canBid = Boolean(me && !me.bankrupt && me.cash >= minBid);
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const progress = seconds / AUCTION_TURN_SECONDS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      aria-label="Property auction"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-md overflow-hidden border border-[rgba(212,168,67,0.28)] bg-[#12121a] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="h-1.5 w-full" style={{ background: groupColor }} />

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
                stroke={seconds < 5 ? "#8b2335" : "#d4a843"}
                strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span
              className={`text-[11px] font-mono font-bold z-10 ${seconds < 5 ? "text-[#e05060]" : "text-[#d4a843]"}`}
            >
              {seconds}s
            </span>
          </div>
        </div>

        <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(212,168,67,0.08)" }}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1">
            Property
          </div>
          <div className="font-display text-3xl font-bold text-white leading-tight">{tile?.name}</div>
          <div className="text-xs font-mono text-[#9baab8] mt-0.5">
            List {formatInr(tile?.price ?? 0)} · Bids in {formatInr(AUCTION_BID_STEP)}
          </div>
        </div>

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

        <div className="max-h-48 space-y-2 overflow-y-auto px-5 py-3">
          <div className="mb-2 flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-[#9baab8]">
            <Timer className="size-3" /> Bidders
          </div>
          {a.activePlayerIds.map((bidderId) => {
            const pl = state.players.find((p) => p.id === bidderId);
            if (!pl) return null;
            const canAfford = pl.cash >= minBid;
            const isCurrent = bidderId === currentBidderId;
            return (
              <div
                key={bidderId}
                className={[
                  "flex items-center gap-3 px-3 py-2.5",
                  isCurrent
                    ? "border border-[rgba(212,168,67,0.35)] bg-[#1a1508]"
                    : "border border-[rgba(255,255,255,0.05)] bg-[#0d0d12]",
                  !canAfford ? "opacity-40" : "",
                ].join(" ")}
              >
                <div className="size-2 shrink-0 rounded-full" style={{ background: pl.avatarColor }} />
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-xs font-semibold ${isCurrent ? "text-[#d4a843]" : "text-white/80"}`}
                  >
                    {pl.username} {bidderId === meId ? "(you)" : ""}
                  </div>
                  <div className="text-[9px] font-mono text-[#9baab8]">{formatInr(pl.cash)}</div>
                </div>
                {isCurrent && (
                  <div className="shrink-0 text-[9px] font-mono text-[#d4a843]">
                    {seconds}s left
                  </div>
                )}
                {!canAfford && (
                  <div className="shrink-0 text-[9px] font-mono text-[#e05060]">Can't afford</div>
                )}
              </div>
            );
          })}
        </div>

        {isMyBid ? (
          <div className="space-y-3 px-5 py-4" style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}>
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#9baab8]">
              Your bid · min {formatInr(minBid)}
            </div>
            <input
              type="number"
              step={AUCTION_BID_STEP}
              min={minBid}
              max={maxBid}
              value={effectiveBid}
              onChange={(event) => setBidAmount(snapAuctionBid(Number(event.target.value) || minBid, minBid))}
              className="w-full border border-[rgba(212,168,67,0.25)] bg-[#0d0d12] px-3 py-3 font-mono text-sm text-[#d4a843] outline-none focus:border-[#d4a843]"
            />
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_RAISES.map((raise) => {
                const nextAmount = snapAuctionBid((bidAmount || minBid) + raise, minBid);
                return (
                  <button
                    key={raise}
                    type="button"
                    onClick={() => setBidAmount(nextAmount)}
                    disabled={!canBid || nextAmount > maxBid}
                    className="min-h-[44px] rounded-sm border border-[rgba(212,168,67,0.25)] text-[10px] font-mono text-[#d4a843] transition-colors hover:bg-[rgba(212,168,67,0.1)] disabled:opacity-30"
                  >
                    +{formatInr(raise)}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <NeonButton
                variant="gold"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onBid(effectiveBid);
                  setBidAmount(minAuctionBid(effectiveBid));
                }}
                disabled={!canBid}
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
            className="px-5 py-4 text-center text-xs font-mono text-[#9baab8]"
            style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}
          >
            Waiting for {state.players.find((p) => p.id === currentBidderId)?.username ?? "bidder"}…
            <div className="mt-1 text-[10px] uppercase tracking-widest">
              Turn passes in {seconds}s
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
