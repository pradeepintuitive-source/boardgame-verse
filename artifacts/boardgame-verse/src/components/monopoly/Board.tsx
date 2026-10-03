import { useMemo } from "react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { Tile } from "./Tile";
import { Token } from "./Token";
import { ArrowRight, Dice5, Gavel, Lock, ShoppingBag, Ticket, Boxes, Sparkles } from "lucide-react";
import { NeonButton } from "../common/NeonButton";
import { effectiveJailFee, formatInr } from "../../utils/monopolyEngine";

/**
 * Board layout: 11x11 CSS grid. Corners are 1x1; edges occupy the 9 cells between them.
 * Tile indices: 0 = bottom-right corner (GO), then walks LEFT along bottom (1..9),
 * 10 = bottom-left (Jail), UP left (11..19), 20 = top-left (Free Parking),
 * RIGHT top (21..29), 30 = top-right (Go to Jail), DOWN right (31..39).
 */
function gridPosition(index: number): {
  row: number;
  col: number;
  orientation: "top" | "right" | "bottom" | "left" | "corner";
} {
  if (index === 0) return { row: 11, col: 11, orientation: "corner" };
  if (index === 10) return { row: 11, col: 1, orientation: "corner" };
  if (index === 20) return { row: 1, col: 1, orientation: "corner" };
  if (index === 30) return { row: 1, col: 11, orientation: "corner" };
  if (index >= 1 && index <= 9) return { row: 11, col: 11 - index, orientation: "bottom" };
  if (index >= 11 && index <= 19) return { row: 11 - (index - 10), col: 1, orientation: "left" };
  if (index >= 21 && index <= 29) return { row: 1, col: 1 + (index - 20), orientation: "top" };
  return { row: 1 + (index - 30), col: 11, orientation: "right" };
}

export function Board({
  state,
  onTileClick,
  highlightTile,
  focusPlayerId,
  onOpenDeck,
  isMyTurn,
  onRoll,
  onBuy,
  onAuction,
  onEnd,
  onPayJail,
  onJailCard,
  actionPending,
}: {
  state: MonopolyState;
  onTileClick?: (idx: number) => void;
  highlightTile?: number | null;
  /** When set, ring that player's deeds + glow their token position */
  focusPlayerId?: string | null;
  onOpenDeck?: (deck: "chance" | "chest") => void;
  isMyTurn?: boolean;
  onRoll?: () => void;
  onBuy?: () => void;
  onAuction?: () => void;
  onEnd?: () => void;
  onPayJail?: () => void;
  onJailCard?: () => void;
  actionPending?: boolean;
}) {
  const players = state.players;
  const properties = state.properties;
  const tokensByTile = useMemo(() => {
    const m: Record<number, typeof players> = {};
    players
      .filter((p) => !p.bankrupt)
      .forEach((p) => {
        (m[p.position] ||= []).push(p);
      });
    return m;
  }, [players]);

  const seatById = useMemo(() => {
    const map: Record<string, number> = {};
    players.forEach((p, i) => {
      map[p.id] = i + 1;
    });
    return map;
  }, [players]);

  const turnPlayer = state.players[state.currentPlayerIndex] ?? null;
  const focusPlayer = focusPlayerId
    ? state.players.find((p) => p.id === focusPlayerId)
    : null;
  const focusColor = focusPlayer?.avatarColor ?? turnPlayer?.avatarColor ?? "#00f2ff";
  const focusOwned = useMemo(() => {
    const set = new Set<number>();
    if (!focusPlayerId) return set;
    Object.entries(properties).forEach(([idx, prop]) => {
      if (prop.ownerId === focusPlayerId) set.add(Number(idx));
    });
    return set;
  }, [focusPlayerId, properties]);
  const focusPosition = focusPlayer && !focusPlayer.bankrupt ? focusPlayer.position : null;
  const turnPosition = turnPlayer && !turnPlayer.bankrupt ? turnPlayer.position : null;
  const turnTile = turnPlayer ? BOARD[turnPlayer.position] : null;
  const turnOwnedCount = turnPlayer
    ? Object.values(properties).filter((property) => property.ownerId === turnPlayer.id).length
    : 0;
  const pendingTile = state.pendingPurchaseTile == null ? null : BOARD[state.pendingPurchaseTile];
  const pendingPrice = pendingTile?.price ?? 0;
  const phaseLabel =
    state.phase === "rolling"
      ? "Ready to roll"
      : state.phase === "moving"
        ? "Moving"
        : state.phase === "landed"
          ? "Resolve landing"
          : state.phase === "auction"
            ? "Auction"
            : state.phase === "trade"
              ? "Trade pending"
              : state.phase === "paused"
                ? "Game paused"
                : "Match over";

  return (
    <div className="relative aspect-square h-full max-h-full w-auto max-w-full mx-auto">
      <div
        className="grid h-full w-full gap-px overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-px"
        style={{ gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(11, 1fr)" }}
      >
        {BOARD.map((tile) => {
          const pos = gridPosition(tile.index);
          const prop = state.properties[tile.index];
          const ownerColor = prop?.ownerId
            ? state.players.find((p) => p.id === prop.ownerId)?.avatarColor
            : null;
          const tokens = tokensByTile[tile.index] ?? [];
          const ownedByFocus = focusOwned.has(tile.index);
          const isFocusPosition = focusPosition === tile.index;
          const isTurnPosition = !focusPlayerId && turnPosition === tile.index;
          return (
            <div
              key={tile.index}
              style={{ gridRow: pos.row, gridColumn: pos.col }}
              className="relative"
            >
              <Tile
                tile={tile}
                prop={prop}
                ownerColor={ownerColor ?? null}
                orientation={pos.orientation}
                onClick={() => tile.type === "chest" || tile.type === "chance" ? onOpenDeck?.(tile.type) : onTileClick?.(tile.index)}
                highlight={highlightTile === tile.index}
                focusOwned={ownedByFocus}
                focusPosition={isFocusPosition || isTurnPosition}
                focusColor={isFocusPosition || ownedByFocus ? focusColor : (turnPlayer?.avatarColor ?? focusColor)}
              />
              {tokens.length > 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-wrap items-end justify-center p-1 gap-0.5">
                  {tokens.map((p, i) => (
                    <Token
                      key={p.id}
                      color={p.avatarColor}
                      label={p.username}
                      stackIndex={i}
                      seatNumber={seatById[p.id]}
                      emphasized={
                        focusPlayerId === p.id ||
                        (!focusPlayerId && turnPlayer?.id === p.id)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {/* Current turn dashboard */}
        <div
          style={{ gridRow: "2 / span 9", gridColumn: "2 / span 9" }}
          className="relative grid place-items-center pointer-events-none"
        >
            <div className="w-full max-w-xl px-1 sm:px-5">
            {turnPlayer && (
              <div
                className="rounded-2xl border bg-card/95 p-2 sm:p-4"
                style={{
                  borderColor: `${turnPlayer.avatarColor}bb`,
                  boxShadow: `0 0 24px ${turnPlayer.avatarColor}35, inset 0 0 28px ${turnPlayer.avatarColor}12`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="grid size-8 shrink-0 place-items-center rounded-full border-2 font-display text-base text-black sm:size-12 sm:text-xl"
                    style={{
                      backgroundColor: turnPlayer.avatarColor,
                      borderColor: `${turnPlayer.avatarColor}aa`,
                      boxShadow: `0 0 16px ${turnPlayer.avatarColor}88`,
                    }}
                  >
                    {turnPlayer.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[9px] font-mono uppercase tracking-[0.25em]"
                      style={{ color: turnPlayer.avatarColor }}
                    >
                      {phaseLabel} · Current turn
                    </div>
                    <div className="text-base sm:text-lg font-bold truncate text-white">
                      {turnPlayer.username}
                      {turnPlayer.isAI && <span className="ml-2 text-[9px] font-mono text-white/45">AI</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[8px] font-mono uppercase tracking-widest text-white/45">
                      Cash
                    </div>
                    <div className="text-sm sm:text-base font-mono font-bold text-accent-amber tabular-nums">
                      ₹{turnPlayer.cash.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {state.lastRoll && (
                  <div className="mt-2 hidden items-center gap-2 border-y border-white/10 py-2 sm:flex">
                    <Dice5 className="size-4 text-accent-cyan" />
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/45">
                      Last roll
                    </span>
                    <span className="font-mono text-lg font-bold tabular-nums text-white">
                      {state.lastRoll.d1 + state.lastRoll.d2}
                    </span>
                  </div>
                )}

                <div className="pointer-events-auto mt-2 rounded-xl border border-white/10 bg-black/35 p-2 sm:mt-3 sm:p-4">
                  <div className="text-[8px] font-mono uppercase tracking-[0.24em] text-accent-cyan">
                    Live action · {phaseLabel}
                  </div>
                  <div className="mt-1 text-sm sm:text-base font-semibold text-white">
                    {state.phase === "rolling"
                      ? isMyTurn ? "Your move" : `${turnPlayer.username} is up`
                      : state.phase === "landed" && pendingTile
                        ? "Property decision"
                        : state.phase === "landed"
                          ? "Landing resolved"
                          : state.phase === "auction"
                            ? "Auction in progress"
                            : state.phase === "trade"
                              ? "Trade in progress"
                              : state.phase === "paused"
                                ? "Game paused"
                                : state.phase === "ended"
                                  ? "Match complete"
                                  : "Movement in progress"}
                  </div>
                  <p className="mt-1 hidden text-[10px] leading-relaxed text-white/60 sm:block sm:text-xs">
                    {state.phase === "rolling"
                      ? isMyTurn
                        ? `Roll to move from ${turnTile?.name ?? "your current space"}.`
                        : `Waiting for ${turnPlayer.username} to roll.`
                      : state.phase === "landed" && pendingTile
                        ? `${turnPlayer.username} landed on ${pendingTile.name}. Buy it for ${formatInr(pendingPrice)} or send it to auction.`
                        : state.phase === "landed"
                          ? state.log.at(-1)?.text ?? `${turnPlayer.username} landed on ${turnTile?.name ?? "a space"}.`
                          : state.phase === "auction"
                            ? "Players are bidding on the property."
                            : state.phase === "trade"
                              ? "Review the pending trade in the player panel."
                              : state.phase === "paused"
                                ? "The host paused this game."
                                : state.phase === "ended"
                                  ? "The game has ended."
                                  : state.log.at(-1)?.text ?? "The board is updating."}
                  </p>

                  {state.phase === "rolling" && (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {turnPlayer.inJail && isMyTurn && turnPlayer.cash >= effectiveJailFee(state) && (
                        <NeonButton variant="ghost" size="sm" onClick={onPayJail} disabled={actionPending} className="!px-2 !py-1.5 !text-[9px]">
                          <Lock className="inline size-3 mr-1" /> Pay {formatInr(effectiveJailFee(state))}
                        </NeonButton>
                      )}
                      {turnPlayer.inJail && isMyTurn && turnPlayer.jailCards > 0 && (
                        <NeonButton variant="ghost" size="sm" onClick={onJailCard} disabled={actionPending} className="!px-2 !py-1.5 !text-[9px]">
                          <Ticket className="inline size-3 mr-1" /> Use Card
                        </NeonButton>
                      )}
                      <NeonButton variant="cyan" size="sm" onClick={onRoll} disabled={!isMyTurn || actionPending} className="!px-3 !py-1.5 !text-[10px]">
                        <Dice5 className="inline size-4 mr-1" /> {actionPending ? "Rolling…" : turnPlayer.inJail ? "Roll Doubles" : "Roll Dice"}
                      </NeonButton>
                    </div>
                  )}

                  {state.phase === "landed" && pendingTile && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <NeonButton
                        variant="cyan"
                        size="sm"
                        onClick={onBuy}
                        disabled={!isMyTurn || actionPending || turnPlayer.cash < pendingPrice}
                        className="min-w-28 !px-3 !py-1.5 !text-[10px]"
                      >
                        <ShoppingBag className="inline size-3.5 mr-1" /> Buy
                      </NeonButton>
                      <NeonButton
                        variant="pink"
                        size="sm"
                        onClick={onAuction}
                        disabled={!isMyTurn || actionPending}
                        className="min-w-28 !px-3 !py-1.5 !text-[10px]"
                      >
                        <Gavel className="inline size-3.5 mr-1" /> Decline & auction
                      </NeonButton>
                    </div>
                  )}

                  {state.phase === "landed" && !pendingTile && (
                    <div className="mt-3 flex justify-center">
                      <NeonButton size="sm" onClick={onEnd} disabled={!isMyTurn || actionPending} className="!px-4 !py-1.5 !text-[10px]">
                        Continue <ArrowRight className="inline size-3.5 ml-1" />
                      </NeonButton>
                    </div>
                  )}
                </div>

                <div className="mt-3 hidden grid-cols-2 gap-1.5 sm:grid sm:grid-cols-4">
                  {[
                    { label: "Position", value: turnTile?.name ?? `Tile ${turnPlayer.position}` },
                    { label: "Properties", value: String(turnOwnedCount) },
                    { label: "Jail cards", value: String(turnPlayer.jailCards) },
                    {
                      label: "Status",
                      value: turnPlayer.bankrupt ? "Bankrupt" : turnPlayer.inJail ? "In jail" : "Active",
                    },
                  ].map((detail) => (
                    <div key={detail.label} className="min-w-0 border-l-2 border-white/15 pl-2 py-0.5">
                      <div className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest text-white/40">
                        {detail.label}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-mono text-white/85 truncate" title={detail.value}>
                        {detail.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 hidden text-center md:block">
              <div className="font-display text-2xl sm:text-3xl italic uppercase neon-text-glow">
                MONOPOLY
              </div>
              <div className="text-[8px] font-mono uppercase tracking-[0.35em] text-accent-cyan mt-0.5">
                GameHub Edition
              </div>
            </div>
            <div className="pointer-events-auto mt-2 hidden justify-center gap-2 sm:flex">
              <NeonButton variant="ghost" size="sm" onClick={() => onOpenDeck?.("chest")} className="!px-2 !py-1 !text-[9px]">
                <Boxes className="inline size-3 mr-1" /> Chest
              </NeonButton>
              <NeonButton variant="ghost" size="sm" onClick={() => onOpenDeck?.("chance")} className="!px-2 !py-1 !text-[9px]">
                <Sparkles className="inline size-3 mr-1" /> Chance
              </NeonButton>
            </div>
            {focusPlayer ? (
              <div
                className="mt-3 text-[10px] font-mono uppercase tracking-widest px-3 py-1 border inline-block"
                style={{
                  color: focusColor,
                  borderColor: `${focusColor}80`,
                  background: `${focusColor}18`,
                }}
              >
                Focusing {focusPlayer.username}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
