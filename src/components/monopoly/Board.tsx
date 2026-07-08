import { useMemo } from "react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { Tile } from "./Tile";
import { Token } from "./Token";

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

  return (
    <div className="relative aspect-square w-full max-w-[820px] mx-auto">
      <div
        className="grid h-full w-full gap-[2px] p-[2px] bg-black/40 border border-white/10"
        style={{ gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(11, 1fr)" }}
      >
        {BOARD.map((tile) => {
          const pos = gridPosition(tile.index);
          const prop = state.properties[tile.index];
          const ownerColor = prop?.ownerId
            ? state.players.find((p) => p.id === prop.ownerId)?.avatarColor
            : null;
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
                ownerColor={ownerColor ?? null}
                orientation={pos.orientation}
                onClick={() => onTileClick?.(tile.index)}
                highlight={highlightTile === tile.index}
              />
              {tokens.length > 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-wrap items-end justify-center p-1 gap-0.5">
                  {tokens.map((p) => (
                    <Token key={p.id} color={p.avatarColor} label={p.username} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {/* Center logo */}
        <div
          style={{ gridRow: "2 / span 9", gridColumn: "2 / span 9" }}
          className="relative grid place-items-center pointer-events-none"
        >
          <div className="text-center">
            <div className="font-display text-5xl md:text-7xl italic uppercase neon-text-glow">
              MONOPOLY
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mt-2">
              GameHub Edition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
