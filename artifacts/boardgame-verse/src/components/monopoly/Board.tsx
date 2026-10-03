import { useMemo } from "react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { Tile } from "./Tile";
import { Token } from "./Token";

/**
 * Board layout: 11×11 CSS grid. Corners are 1×1; edges occupy the 9 cells between them.
 * Tile indices: 0 = bottom-right (GO), walks LEFT along bottom (1-9),
 * 10 = bottom-left (Jail), UP left (11-19), 20 = top-left (Free Parking),
 * RIGHT top (21-29), 30 = top-right (Go to Jail), DOWN right (31-39).
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
}: {
  state: MonopolyState;
  onTileClick?: (idx: number) => void;
  highlightTile?: number | null;
}) {
  const tokensByTile = useMemo(() => {
    const m: Record<number, typeof state.players> = {};
    state.players
      .filter((p) => !p.bankrupt)
      .forEach((p) => {
        (m[p.position] ||= []).push(p);
      });
    return m;
  }, [state.players]);

  // Build a quick lookup of player → index for token shapes
  const playerIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    state.players.forEach((p, i) => {
      map[p.id] = i;
    });
    return map;
  }, [state.players]);

  return (
    <div className="relative aspect-square w-full max-w-[860px] mx-auto">
      {/* Outer board frame — premium border + shadow */}
      <div
        className="absolute -inset-3 rounded-sm pointer-events-none"
        style={{
          border: "2px solid rgba(212,168,67,0.25)",
          boxShadow: "0 0 0 1px rgba(212,168,67,0.1), 0 16px 64px rgba(0,0,0,0.85)",
        }}
      />

      {/* Board surface */}
      <div
        className="h-full w-full rounded-sm overflow-hidden"
        style={{
          background: "#111c16",
          border: "2px solid rgba(212,168,67,0.3)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: "repeat(11, 1fr)",
            gridTemplateRows: "repeat(11, 1fr)",
            gap: "1px",
            background: "rgba(212,168,67,0.08)",
          }}
        >
          {BOARD.map((tile) => {
            const pos = gridPosition(tile.index);
            const prop = state.properties[tile.index];
            const ownerPlayer = prop?.ownerId
              ? state.players.find((p) => p.id === prop.ownerId)
              : null;
            const ownerColor = ownerPlayer?.avatarColor ?? null;
            const tokens = tokensByTile[tile.index] ?? [];

            return (
              <div
                key={tile.index}
                style={{ gridRow: pos.row, gridColumn: pos.col }}
                className="relative"
              >
                <Tile
                  tile={tile}
                  prop={prop}
                  ownerColor={ownerColor}
                  orientation={pos.orientation}
                  onClick={() => onTileClick?.(tile.index)}
                  highlight={highlightTile === tile.index}
                />

                {/* Tokens — fan out when multiple players on same tile */}
                {tokens.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none flex flex-wrap items-end justify-center p-0.5 gap-px">
                    {tokens.map((p, ti) => (
                      <Token
                        key={p.id}
                        color={p.avatarColor}
                        label={p.username}
                        playerIndex={playerIndexMap[p.id] ?? ti}
                        size="sm"
                        isCurrent={state.players[state.currentPlayerIndex]?.id === p.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Board center: logo + current-turn card ── */}
          <div
            style={{ gridRow: "2 / span 9", gridColumn: "2 / span 9" }}
            className="relative flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(212,168,67,0.05) 0%, transparent 65%)",
              }}
            />

            {/* Logo */}
            <div className="text-center z-10 px-2">
              <div
                className="font-display font-bold uppercase leading-none tracking-wide"
                style={{
                  fontSize: "clamp(1.1rem, 3.5vw, 3rem)",
                  color: "#d4a843",
                  textShadow: "0 0 20px rgba(212,168,67,0.4)",
                }}
              >
                Bharat Business
              </div>
              <div
                className="font-sans uppercase tracking-[0.25em] mt-1"
                style={{
                  fontSize: "clamp(0.4rem, 1vw, 0.75rem)",
                  color: "rgba(212,168,67,0.55)",
                }}
              >
                Build · Trade · Grow
              </div>
            </div>

            {/* Current-turn mini-card */}
            {(() => {
              const cur = state.players[state.currentPlayerIndex];
              if (!cur) return null;
              const props = Object.values(state.properties).filter(
                (p) => p?.ownerId === cur.id,
              ).length;
              const curTile = BOARD[cur.position];
              return (
                <div
                  className="z-10 mt-2 text-center pointer-events-none"
                  style={{
                    border: "1px solid rgba(212,168,67,0.25)",
                    borderRadius: "4px",
                    background: "rgba(13,13,18,0.85)",
                    padding: "clamp(3px, 1vw, 8px) clamp(4px, 1.5vw, 12px)",
                    maxWidth: "60%",
                  }}
                >
                  <div
                    className="font-sans font-semibold uppercase tracking-wide"
                    style={{ fontSize: "clamp(0.4rem, 1vw, 0.7rem)", color: cur.avatarColor }}
                  >
                    {cur.username}
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: "clamp(0.35rem, 0.9vw, 0.65rem)", color: "#d4a843" }}
                  >
                    {curTile?.name ?? "—"} · {props} props
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
