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
          ? "Decide"
          : "Continue"
        : state.phase === "auction"
          ? "Auction"
          : "Turn";

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
      className={`relative overflow-hidden rounded-sm border cursor-pointer transition-all duration-200 ${
        compact ? "p-2" : "p-3"
      } ${player.bankrupt ? "opacity-40" : ""} ${
        isCurrent
          ? "bg-white/[0.04]"
          : selected
            ? "bg-white/[0.03]"
            : "bg-black/30 hover:bg-white/[0.03]"
      }`}
      style={
        isCurrent
          ? {
              borderColor: `${player.avatarColor}cc`,
              boxShadow: `inset 0 0 0 1px ${player.avatarColor}33, 0 0 18px ${player.avatarColor}40`,
            }
          : selected
            ? {
                borderColor: `${player.avatarColor}99`,
                boxShadow: `0 0 12px ${player.avatarColor}35`,
              }
            : { borderColor: "rgba(255,255,255,0.1)" }
      }
    >
      {isCurrent ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ background: player.avatarColor, boxShadow: `0 0 8px ${player.avatarColor}` }}
        />
      ) : null}

      <div className="flex items-center gap-2 min-w-0">
        <div className="relative shrink-0">
          <div
            className={`${compact ? "size-7" : "size-8"} rounded-full grid place-items-center font-mono text-[11px] font-bold text-black ring-2 ring-black/40`}
            style={{
              background: player.avatarColor,
              boxShadow: isCurrent
                ? `0 0 12px ${player.avatarColor}aa`
                : `0 0 6px ${player.avatarColor}66`,
            }}
          >
            {player.username.slice(0, 1).toUpperCase()}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-[#0a0a0c] border border-white/25 grid place-items-center text-[7px] font-mono text-white/80">
            {seatNumber}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold truncate leading-tight">{player.username}</span>
            {player.isAI && <Bot className="size-3 text-accent-cyan shrink-0" />}
            {isMe && (
              <span className="text-[8px] font-mono uppercase tracking-wider text-accent-cyan shrink-0">
                You
              </span>
            )}
            {isCurrent && (
              <span
                className="ml-auto text-[7px] font-mono uppercase tracking-[0.2em] font-bold shrink-0 px-1.5 py-0.5 rounded-sm"
                style={{
                  color: player.avatarColor,
                  background: `${player.avatarColor}22`,
                  border: `1px solid ${player.avatarColor}55`,
                }}
              >
                {phaseHint}
              </span>
            )}
            {player.inJail && <Lock className="size-3 text-destructive shrink-0" />}
          </div>
          <div className="flex items-baseline gap-2 mt-0.5 min-w-0">
            <span className="text-[12px] font-mono font-bold text-accent-amber tabular-nums">
              {formatInr(player.cash)}
            </span>
            <span className="text-[8px] font-mono text-white/35 truncate" title={tileName}>
              {tileName}
            </span>
          </div>
        </div>

        {showTurn ? (
          <div
            className="shrink-0 self-start"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Dice roll={state.lastRoll} compact />
          </div>
        ) : null}
      </div>

      {props.length > 0 && (
        <div className={`mt-1.5 flex flex-wrap gap-1 ${showTurn ? "max-h-11" : "max-h-14"} overflow-y-auto`}>
          {props.map((i) => {
            const tile = BOARD[i];
            const prop = state.properties[i];
            const color = tile.group ? GROUP_COLORS[tile.group] : "#888";
            const houses = prop?.houses ?? 0;
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTile?.(i);
                }}
                className="inline-flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded-sm border border-white/10 hover:border-white/30 transition-colors"
                style={{ background: `${color}22`, color }}
                title={tile.name}
              >
                <span className="size-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="truncate max-w-[4.5rem]">{shortTileName(tile)}</span>
                {prop?.mortgaged ? (
                  <span className="text-destructive">M</span>
                ) : houses >= 5 ? (
                  <span className="text-destructive">H</span>
                ) : houses > 0 ? (
                  <span className="text-accent-amber">{houses}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {showTurn && turnActions ? (
        <div
          className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {!myTurn && (
            <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-white/35 text-center">
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
                className="flex-1 min-w-0 !text-[9px] !py-1 !px-2"
              >
                <Dice5 className="inline size-3 mr-1" />
                {player.inJail ? "Roll Doubles" : "Roll Dice"}
              </NeonButton>
              {myTurn && player.inJail && player.cash >= effectiveJailFee(state) && (
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={turnActions.onPayJail}
                  className="!text-[9px] !py-1 !px-2"
                >
                  <Lock className="inline size-3 mr-1" /> Pay {formatInr(effectiveJailFee(state))}
                </NeonButton>
              )}
              {myTurn && player.inJail && player.jailCards > 0 && (
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={turnActions.onJailCard}
                  className="!text-[9px] !py-1 !px-2"
                >
                  <Ticket className="inline size-3 mr-1" /> Card
                </NeonButton>
              )}
            </div>
          )}

          {myTurn && state.phase === "landed" && pending != null && pendingTile && (
            <div>
              <div className="text-[10px] mb-1 leading-snug text-white/80">
                Buy <span className="font-semibold text-white">{pendingTile.name}</span> for{" "}
                <span className="text-accent-amber font-mono">{formatInr(price)}</span>?
              </div>
              <div className="flex gap-1">
                <NeonButton
                  variant="cyan"
                  size="sm"
                  onClick={turnActions.onBuy}
                  disabled={player.cash < price}
                  className="flex-1 !text-[9px] !py-1 !px-2"
                >
                  <ShoppingBag className="inline size-3 mr-1" /> Buy
                </NeonButton>
                <NeonButton
                  variant="pink"
                  size="sm"
                  onClick={turnActions.onAuction}
                  className="flex-1 !text-[9px] !py-1 !px-2"
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
              className="w-full !text-[9px] !py-1 !px-2"
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
          className="mt-1.5 w-full text-[8px] font-mono uppercase tracking-[0.2em] border border-white/15 text-white/55 py-1 rounded-sm hover:border-accent-pink/60 hover:text-accent-pink transition-colors"
        >
          Propose Trade
        </button>
      )}
    </div>
  );
}
