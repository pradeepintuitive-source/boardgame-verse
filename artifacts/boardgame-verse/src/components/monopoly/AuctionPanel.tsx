import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gavel } from "lucide-react";
import { BOARD, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyPlayer, MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { formatInr } from "../../utils/monopolyEngine";

const BID_CHIPS = [50, 100, 200, 500, 1000];

function samePlayer(playerId: string | null | undefined, me: MonopolyPlayer | undefined) {
  if (!playerId || !me) return false;
  return (
    String(playerId) === String(me.id) ||
    (me.userId != null && String(playerId) === String(me.userId))
  );
}

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
  const minBid = a ? a.highestBid + 10 : 10;
  const me =
    state.players.find((p) => p.id === meId) ??
    state.players.find((p) => p.userId === meId) ??
    state.players[0];
  const cash = me?.cash ?? 0;
  const maxBid = cash;
  const [amount, setAmount] = useState(minBid);

  const currentBidderId = a?.activePlayerIds[a.currentBidderIndex] ?? a?.activePlayerIds[0];
  const inAuction = Boolean(
    a && me && a.activePlayerIds.some((id) => samePlayer(id, me)),
  );
  const isMyBid = Boolean(a && samePlayer(currentBidderId, me) && me && !me.bankrupt && inAuction);

  useEffect(() => {
    if (!a) return;
    setAmount(Math.min(Math.max(minBid, 0), maxBid));
  }, [a, isMyBid, minBid, maxBid, a?.currentBidderIndex, a?.highestBid]);

  if (!a) return null;

  const tile = BOARD[a.tileIndex];
  const clamped = Math.min(Math.max(amount || minBid, minBid), maxBid);
  const canBid = isMyBid && maxBid >= minBid && clamped >= minBid && clamped <= maxBid;
  const bidder =
    state.players.find((p) => samePlayer(currentBidderId, p)) ??
    state.players.find((p) => String(p.id) === String(currentBidderId));
  const bidderName = bidder?.username ?? "Waiting for bids";
  const highest =
    a.highestBidderId != null
      ? state.players.find((p) => samePlayer(a.highestBidderId, p))
      : null;
  const groupColor = tile?.group ? GROUP_COLORS[tile.group] : "#ff00e5";

  const addChip = (chip: number) => {
    setAmount((prev) => Math.min(maxBid, Math.max(minBid, (prev || minBid) + chip)));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="glass-panel border border-accent-pink/40 p-8 max-w-md w-full text-center"
      >
        <div className="h-2 w-full mb-4 rounded-sm" style={{ background: groupColor }} />
        <Gavel className="size-10 text-accent-pink mx-auto mb-2" />
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-pink mb-2">
          Live Auction
        </div>
        <h2 className="font-display text-3xl italic uppercase mb-1">{tile?.name}</h2>
        <div className="text-xs font-mono text-white/40 mb-6">List {formatInr(tile?.price ?? 0)}</div>

        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Highest Bid
        </div>
        <div className="font-display text-5xl italic text-accent-amber mb-2">
          {formatInr(a.highestBid)}
        </div>
        {highest ? (
          <div className="text-xs font-mono mb-4">by {highest.username}</div>
        ) : (
          <div className="text-xs font-mono mb-4 text-white/40">No bids yet</div>
        )}

        <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-4">
          {isMyBid ? "Your turn to bid" : `Bidding: ${bidderName}`}
        </div>

        {isMyBid ? (
          <div className="flex flex-col gap-3">
            {maxBid < minBid ? (
              <div className="text-xs font-mono text-destructive">
                Not enough cash to bid (need {formatInr(minBid)}). Pass instead.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1 justify-center">
                  {BID_CHIPS.map((chip) => {
                    const next = Math.min(maxBid, Math.max(minBid, (amount || minBid) + chip));
                    const disabled = (amount || minBid) >= maxBid || next === (amount || minBid);
                    return (
                      <button
                        key={chip}
                        type="button"
                        disabled={disabled}
                        onClick={() => addChip(chip)}
                        className="px-2 py-1 border border-accent-amber/40 text-accent-amber font-mono text-[10px] disabled:opacity-30 hover:bg-accent-amber/15"
                      >
                        +{formatInr(chip)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={minBid}
                    max={maxBid}
                    value={clamped}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      if (!Number.isFinite(raw)) return;
                      setAmount(Math.min(maxBid, Math.max(0, raw)));
                    }}
                    onBlur={() => setAmount(clamped)}
                    className="flex-1 bg-black/40 border border-white/20 px-3 py-2 font-mono text-accent-amber"
                  />
                  <NeonButton variant="cyan" disabled={!canBid} onClick={() => onBid(clamped)}>
                    Bid
                  </NeonButton>
                </div>
                <div className="text-[10px] font-mono text-white/45">
                  Your cash: {formatInr(cash)} · Max bid {formatInr(maxBid)} · Min{" "}
                  {formatInr(minBid)}
                </div>
              </>
            )}
            <NeonButton variant="ghost" size="sm" onClick={onPass}>
              Pass
            </NeonButton>
          </div>
        ) : inAuction ? (
          <div className="text-xs font-mono text-white/50 animate-pulse">
            Waiting for {bidderName} to bid or pass…
          </div>
        ) : (
          <div className="text-xs font-mono text-white/50">You are out of this auction.</div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-mono text-white/40">
          Remaining:{" "}
          {a.activePlayerIds
            .map((id) => state.players.find((p) => samePlayer(id, p))?.username ?? "—")
            .join(" · ")}
        </div>
      </motion.div>
    </motion.div>
  );
}
