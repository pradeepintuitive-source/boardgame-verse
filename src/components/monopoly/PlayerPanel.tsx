import { ArrowRight, Bot, Dice5, Gavel, Lock, ShoppingBag, Ticket } from "lucide-react";
import { BOARD, GROUP_COLORS, shortTileName } from "../../data/monopolyBoard";
import type { MonopolyState, MonopolyPlayer } from "../../models/monopoly";
import { effectiveJailFee, formatInr } from "../../utils/monopolyEngine";
import { NeonButton } from "../common/NeonButton";
import { Dice } from "./Dice";

export type PlayerTurnActions = {
  isMyTurn: boolean;
  onRoll: () => void;
  onBuy: () => void;
  onAuction: () => void;
  onEnd: () => void;
  onPayJail: () => void;
  onJailCard: () => void;
};

export function PlayerPanel({
  state,
  player,
  isCurrent,
  isMe,
  seatNumber,
  selected,
  onSelectPlayer,
  onSelectTile,
  onProposeTrade,
  turnActions,
  compact = false,
}: {
  state: MonopolyState;
  player: MonopolyPlayer;
  isCurrent: boolean;
  isMe: boolean;
  seatNumber: number;
  selected?: boolean;
  onSelectPlayer?: () => void;
  onSelectTile?: (idx: number) => void;
  onProposeTrade?: () => void;
  turnActions?: PlayerTurnActions;
  compact?: boolean;
}) {
  const props = Object.entries(state.properties)
    .filter(([, p]) => p.ownerId === player.id)
    .map(([i]) => +i);

  const tileName = BOARD[player.position]?.name ?? `Tile ${player.position}`;
  const pending = state.pendingPurchaseTile;
  const pendingTile = pending != null ? BOARD[pending] : null;
  const price = pendingTile?.price ?? 0;
  const showTurn = Boolean(isCurrent && turnActions);
  const myTurn = Boolean(turnActions?.isMyTurn);

  const phaseHint =
    state.phase === "rolling"
      ? "Rolling"
      : state.phase === "landed"
        ? pending != null
          ? "Buy / Auction"
          : "Continue"
        : state.phase === "auction"
          ? "Auction"
          : "In control";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectPlayer?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectPlayer?.();
        }
      }}
      className={`glass-panel ${compact ? "p-2" : "p-3"} border cursor-pointer transition-shadow ${
        player.bankrupt ? "opacity-40" : ""
      }`}
      style={
        isCurrent
          ? {
              borderColor: player.avatarColor,
              boxShadow: `0 0 0 2px ${player.avatarColor}, 0 0 22px ${player.avatarColor}88`,
              background: `${player.avatarColor}14`,
            }
          : selected
            ? {
                boxShadow: `0 0 0 2px ${player.avatarColor}, 0 0 16px ${player.avatarColor}55`,
              }
            : undefined
      }
    >
      {isCurrent ? (
        <div
          className="text-[8px] font-mono uppercase tracking-[0.25em] mb-1 font-bold"
          style={{ color: player.avatarColor }}
        >
          Turn · {phaseHint}
        </div>
      ) : null}

      <div className="flex items-start gap-2 mb-1">
        <div className="relative shrink-0">
          <div
            className={`${compact ? "size-6" : "size-7"} rounded-full border-2 border-white/70 grid place-items-center font-mono text-[10px] font-bold text-black`}
            style={{
              background: player.avatarColor,
              boxShadow: isCurrent ? `0 0 14px ${player.avatarColor}` : `0 0 8px ${player.avatarColor}`,
            }}
          >
            {player.username.slice(0, 1).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-black border border-white/40 grid place-items-center text-[7px] font-mono text-white">
            {seatNumber}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate flex items-center gap-1">
            {player.username}
            {player.isAI && <Bot className="size-3 text-accent-cyan" />}
            {isMe && <span className="text-[9px] font-mono text-accent-cyan">(YOU)</span>}
          </div>
          <div className="text-[10px] font-mono text-accent-amber">{formatInr(player.cash)}</div>
          <div className="text-[8px] font-mono text-white/40 truncate" title={tileName}>
            At {tileName}
          </div>
        </div>
        {player.inJail && <Lock className="size-3.5 text-destructive shrink-0" />}
        {showTurn ? (
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Dice roll={state.lastRoll} compact />
          </div>
        ) : null}
      </div>

      {props.length > 0 && (
        <div
          className={`flex flex-col gap-0.5 overflow-y-auto pr-1 ${
            showTurn ? "max-h-12" : compact ? "max-h-14" : "max-h-24"
          }`}
        >
          {props.map((i) => {
            const tile = BOARD[i];
            const prop = state.properties[i];
            const color = tile.group ? GROUP_COLORS[tile.group] : "#666";
            const houses = prop?.houses ?? 0;
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTile?.(i);
                }}
                className="flex items-center gap-2 text-left text-[9px] font-mono px-1 py-0.5 hover:brightness-125"
                style={{ background: `${color}18`, borderLeft: `3px solid ${color}` }}
                title={tile.name}
              >
                <span className="flex-1 truncate" style={{ color }}>
                  {shortTileName(tile)}
                </span>
                {prop?.mortgaged ? (
                  <span className="text-destructive text-[8px]">MTG</span>
                ) : houses >= 5 ? (
                  <span className="size-1.5 bg-destructive rounded-sm" />
                ) : houses > 0 ? (
                  <span className="flex gap-0.5">
                    {Array.from({ length: houses }).map((_, h) => (
                      <span key={h} className="size-1 bg-accent-amber rounded-sm" />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {showTurn && turnActions ? (
        <div
          className="mt-1.5 pt-1.5 border-t border-white/10 flex flex-col gap-1.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {!myTurn && (
            <div className="text-[8px] font-mono uppercase tracking-widest text-white/40 text-center">
              Waiting for {player.username}…
            </div>
          )}

          {state.phase === "rolling" && (
            <div className="flex flex-wrap gap-1">
              <NeonButton
                variant="cyan"
                size="sm"
                onClick={turnActions.onRoll}
                disabled={!myTurn}
                className="flex-1 min-w-0 !text-[9px] !py-1"
              >
                <Dice5 className="inline size-3 mr-1" />
                {player.inJail ? "Roll Doubles" : "Roll Dice"}
              </NeonButton>
              {myTurn && player.inJail && player.cash >= effectiveJailFee(state) && (
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={turnActions.onPayJail}
                  className="!text-[9px] !py-1"
                >
                  <Lock className="inline size-3 mr-1" /> Pay {formatInr(effectiveJailFee(state))}
                </NeonButton>
              )}
              {myTurn && player.inJail && player.jailCards > 0 && (
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={turnActions.onJailCard}
                  className="!text-[9px] !py-1"
                >
                  <Ticket className="inline size-3 mr-1" /> Card
                </NeonButton>
              )}
            </div>
          )}

          {myTurn && state.phase === "landed" && pending != null && pendingTile && (
            <div>
              <div className="text-[10px] mb-1 leading-snug">
                Buy <b>{pendingTile.name}</b> for {formatInr(price)}?
              </div>
              <div className="flex gap-1">
                <NeonButton
                  variant="cyan"
                  size="sm"
                  onClick={turnActions.onBuy}
                  disabled={player.cash < price}
                  className="flex-1 !text-[9px] !py-1"
                >
                  <ShoppingBag className="inline size-3 mr-1" /> Buy
                </NeonButton>
                <NeonButton
                  variant="pink"
                  size="sm"
                  onClick={turnActions.onAuction}
                  className="flex-1 !text-[9px] !py-1"
                >
                  <Gavel className="inline size-3 mr-1" /> Auction
                </NeonButton>
              </div>
            </div>
          )}

          {myTurn && state.phase === "landed" && pending == null && (
            <NeonButton
              size="sm"
              onClick={turnActions.onEnd}
              className="w-full !text-[9px] !py-1"
            >
              Continue <ArrowRight className="inline size-3 ml-1" />
            </NeonButton>
          )}
        </div>
      ) : null}

      {onProposeTrade && !isMe && !player.bankrupt && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onProposeTrade();
          }}
          className="mt-1 w-full text-[8px] font-mono uppercase tracking-widest border border-white/20 py-0.5 hover:border-accent-pink hover:text-accent-pink"
        >
          Propose Trade
        </button>
      )}
    </div>
  );
}
