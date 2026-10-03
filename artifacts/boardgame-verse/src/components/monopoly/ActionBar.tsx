import { Dice5, ArrowRight, ShoppingBag, Gavel, Lock, Ticket } from "lucide-react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyPlayer, MonopolyState } from "../../models/monopoly";
import { formatInr, effectiveJailFee } from "../../utils/monopolyEngine";
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
  const cur = state.players[state.currentPlayerIndex] ?? state.players[0];
  const pending = state.pendingPurchaseTile;
  const tile = pending != null ? BOARD[pending] : null;
  const price = tile?.price ?? 0;
  const canAfford = me.cash >= price;

  return (
    <div
      className="rounded-sm border border-[rgba(212,168,67,0.2)] bg-[#12121a] px-4 py-3 flex flex-col gap-3"
      role="region"
      aria-label="Game actions"
    >
      {/* Turn header + dice */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#9baab8]">
            Current Turn
          </div>
          <div
            className="text-sm font-bold mt-0.5"
            style={{ color: cur?.avatarColor ?? "#d4a843" }}
          >
            {cur?.username ?? "—"}
          </div>
          {!isMyTurn && (
            <div className="text-[10px] font-mono text-[#9baab8] mt-0.5">
              Waiting for {cur?.username}…
            </div>
          )}
        </div>
        <Dice roll={state.lastRoll} />
      </div>

      {/* ── Rolling phase ── */}
      {state.phase === "rolling" && (
        <div className="flex flex-wrap gap-2">
          <NeonButton
            variant="gold"
            size="sm"
            onClick={onRoll}
            disabled={!isMyTurn}
            icon={<Dice5 className="size-4" />}
          >
            {me.inJail ? "Roll for Doubles" : "Roll Dice"}
          </NeonButton>

          {me.inJail && me.cash >= effectiveJailFee(state) && (
            <NeonButton variant="ghost" size="sm" onClick={onPayJail} disabled={!isMyTurn}>
              <Lock className="inline size-3 mr-1" />
              Pay {formatInr(effectiveJailFee(state))}
            </NeonButton>
          )}

          {me.inJail && me.jailCards > 0 && (
            <NeonButton variant="ghost" size="sm" onClick={onJailCard} disabled={!isMyTurn}>
              <Ticket className="inline size-3 mr-1" />
              Use Card
            </NeonButton>
          )}
        </div>
      )}

      {/* ── Decision phase: buy or auction ── */}
      {isMyTurn && state.phase === "landed" && pending != null && tile && (
        <div className="rounded-sm border border-[rgba(212,168,67,0.2)] bg-[#1a1508] p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#9baab8] mb-1">
            Unowned Property
          </div>
          <div className="font-display text-base font-bold mb-0.5" style={{ color: "#d4a843" }}>
            {tile.name}
          </div>
          <div className="text-sm font-mono mb-3" style={{ color: "#d4a843" }}>
            {formatInr(price)}
            {!canAfford && (
              <span className="ml-2 text-[10px] text-[#e05060]">Insufficient funds</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <NeonButton
              variant="gold"
              size="sm"
              onClick={onBuy}
              disabled={!canAfford}
              icon={<ShoppingBag className="size-3.5" />}
            >
              Acquire {formatInr(price)}
            </NeonButton>
            <NeonButton
              variant="ruby"
              size="sm"
              onClick={onAuction}
              icon={<Gavel className="size-3.5" />}
            >
              Pass to Auction
            </NeonButton>
          </div>
        </div>
      )}

      {/* ── End turn ── */}
      {isMyTurn && state.phase === "landed" && pending == null && (
        <NeonButton onClick={onEnd} icon={<ArrowRight className="size-4" />}>
          End Turn
        </NeonButton>
      )}
    </div>
  );
}
