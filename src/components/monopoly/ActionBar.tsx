import { Dice5, ArrowRight, ShoppingBag, Gavel, Lock, Ticket } from "lucide-react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyPlayer, MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { Dice } from "./Dice";

interface Props {
  state: MonopolyState;
  me: MonopolyPlayer;
  isMyTurn: boolean;
  onRoll: () => void;
  onBuy: () => void;
  onAuction: () => void;
  onEnd: () => void;
  onPayJail: () => void;
  onJailCard: () => void;
}

export function ActionBar({
  state,
  me,
  isMyTurn,
  onRoll,
  onBuy,
  onAuction,
  onEnd,
  onPayJail,
  onJailCard,
}: Props) {
  const cur = state.players[state.currentPlayerIndex] ?? state.players[0] ?? {
    id: "",
    username: "Player",
    avatarColor: "#fff",
    isAI: false,
    position: 0,
    cash: 0,
    inJail: false,
    jailTurns: 0,
    jailCards: 0,
    bankrupt: true,
  };
  const pending = state.pendingPurchaseTile;
  const tile = pending != null ? BOARD[pending] : null;
  const price = tile?.price ?? 0;

  return (
    <div className="glass-panel border border-accent-cyan/30 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">Turn</div>
          <div className="font-bold" style={{ color: cur.avatarColor }}>
            {cur.username}
          </div>
        </div>
        <Dice roll={state.lastRoll} />
      </div>

      {!isMyTurn && (
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 text-center py-2">
          Waiting for {cur.username}…
        </div>
      )}

      {isMyTurn && state.phase === "rolling" && (
        <div className="flex flex-wrap gap-2">
          <NeonButton variant="cyan" onClick={onRoll}>
            <Dice5 className="inline size-4 mr-1" />
            {me.inJail ? "Roll for Doubles" : "Roll Dice"}
          </NeonButton>
          {me.inJail && me.cash >= 50 && (
            <NeonButton variant="ghost" size="sm" onClick={onPayJail}>
              <Lock className="inline size-3 mr-1" /> Pay $50
            </NeonButton>
          )}
          {me.inJail && me.jailCards > 0 && (
            <NeonButton variant="ghost" size="sm" onClick={onJailCard}>
              <Ticket className="inline size-3 mr-1" /> Use Card
            </NeonButton>
          )}
        </div>
      )}

      {isMyTurn && state.phase === "landed" && pending != null && tile && (
        <div>
          <div className="text-xs mb-2">
            Buy <b>{tile.name}</b> for ${price}?
          </div>
          <div className="flex gap-2">
            <NeonButton variant="cyan" size="sm" onClick={onBuy} disabled={me.cash < price}>
              <ShoppingBag className="inline size-3 mr-1" /> Buy
            </NeonButton>
            <NeonButton variant="pink" size="sm" onClick={onAuction}>
              <Gavel className="inline size-3 mr-1" /> Auction
            </NeonButton>
          </div>
        </div>
      )}

      {isMyTurn && state.phase === "landed" && pending == null && (
        <NeonButton onClick={onEnd}>
          End Turn <ArrowRight className="inline size-4 ml-1" />
        </NeonButton>
      )}
    </div>
  );
}
