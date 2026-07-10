import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel } from "lucide-react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";

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
  const [amount, setAmount] = useState<number>(0);
  if (!a) return null;
  const tile = BOARD[a.tileIndex];
  const me = state.players.find((p) => p.id === meId) ?? state.players[0];
  const currentBidderId = a.activePlayerIds[a.currentBidderIndex] ?? a.activePlayerIds[0];
  const isMyBid =
    currentBidderId === meId && Boolean(me) && !me.bankrupt && a.activePlayerIds.includes(meId);
  const minBid = a.highestBid + 10;

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
        <Gavel className="size-10 text-accent-pink mx-auto mb-2" />
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-pink mb-2">
          Live Auction
        </div>
        <h2 className="font-display text-3xl italic uppercase mb-1">{tile.name}</h2>
        <div className="text-xs font-mono text-white/40 mb-6">List $${tile.price}</div>

        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Highest Bid
        </div>
        <div className="font-display text-5xl italic text-accent-amber mb-4">${a.highestBid}</div>
        {a.highestBidderId && (
          <div className="text-xs font-mono mb-4">
            by {state.players.find((p) => p.id === a.highestBidderId)?.username}
          </div>
        )}

        <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-4">
          Bidding: {state.players.find((p) => p.id === currentBidderId)?.username}
        </div>

        {isMyBid ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="number"
                min={minBid}
                max={me!.cash}
                value={amount || minBid}
                onChange={(e) => setAmount(+e.target.value)}
                className="flex-1 bg-black/40 border border-white/20 px-3 py-2 font-mono text-accent-amber"
              />
              <NeonButton variant="cyan" onClick={() => onBid(Math.max(minBid, amount))}>
                Bid
              </NeonButton>
            </div>
            <NeonButton variant="ghost" size="sm" onClick={onPass}>
              Pass
            </NeonButton>
          </div>
        ) : (
          <div className="text-xs font-mono text-white/50 animate-pulse">Waiting for bidder…</div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-mono text-white/40">
          Remaining:{" "}
          {a.activePlayerIds
            .map((id) => state.players.find((p) => p.id === id)?.username)
            .join(" · ")}
        </div>
      </motion.div>
    </motion.div>
  );
}
