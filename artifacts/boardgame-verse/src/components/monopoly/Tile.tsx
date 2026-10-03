import type { ReactNode } from "react";
import { GROUP_COLORS, DEVELOPMENT_LABELS } from "../../data/monopolyBoard";
import type { PropertyState, Tile as TileType } from "../../models/monopoly";
import { formatInr } from "../../utils/monopolyEngine";

interface Props {
  tile: TileType;
  prop?: PropertyState;
  ownerColor?: string | null;
  orientation: "top" | "right" | "bottom" | "left" | "corner";
  onClick?: () => void;
  children?: ReactNode;
  highlight?: boolean;
}

/** Map development level (0-5) to concise badge text */
const DEV_BADGE = ["", "Village", "Town", "City", "Metro", "Smart City"] as const;

export function Tile({ tile, prop, ownerColor, orientation, onClick, children, highlight }: Props) {
  const isCorner = orientation === "corner";
  const isVertical = orientation === "left" || orientation === "right";
  const isTop = orientation === "top";
  const isBottom = orientation === "bottom";

  const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;

  // Color band sits on the side closest to the board edge
  const bandPos = isBottom
    ? "top"
    : isTop
      ? "bottom"
      : isVertical
        ? orientation === "left"
          ? "right"
          : "left"
        : null;

  const devLevel = prop?.houses ?? 0;
  const devBadge = devLevel > 0 ? DEV_BADGE[Math.min(devLevel, 5)] : null;
  const isMortgaged = !!prop?.mortgaged;

  return (
    <button
      onClick={onClick}
      aria-label={`${tile.name}${tile.price != null ? ` – ${formatInr(tile.price)}` : ""}`}
      className={[
        "relative w-full h-full tile-surface text-left overflow-hidden",
        "hover:border-[rgba(212,168,67,0.35)] transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-[#d4a843] focus-visible:outline-offset-1",
        highlight ? "tile-highlight" : "",
      ].join(" ")}
    >
      {/* Group color band */}
      {groupColor && bandPos && (
        <div
          className={[
            "absolute",
            bandPos === "top"
              ? "top-0 left-0 right-0 h-[18%] min-h-[6px]"
              : bandPos === "bottom"
                ? "bottom-0 left-0 right-0 h-[18%] min-h-[6px]"
                : bandPos === "left"
                  ? "left-0 top-0 bottom-0 w-[18%] min-w-[5px]"
                  : "right-0 top-0 bottom-0 w-[18%] min-w-[5px]",
          ].join(" ")}
          style={{ background: groupColor }}
        />
      )}

      {/* Owner strip at bottom of tile */}
      {ownerColor && !isCorner && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{ background: ownerColor }}
        />
      )}

      {/* Tile content */}
      {isCorner ? (
        /* Corner tiles: centered layout */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center gap-0.5">
          <span className="font-display text-[9px] md:text-[11px] font-bold uppercase leading-tight text-[#d4a843]">
            {tile.name}
          </span>
        </div>
      ) : isVertical ? (
        /* Left / Right column: rotate text to fit */
        <div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: orientation === "left" ? "rotate(180deg)" : "none",
          }}
        >
          <span className="font-sans text-[7px] md:text-[8px] font-semibold uppercase tracking-wide leading-tight text-white/90 truncate max-h-full">
            {tile.name}
          </span>
          {tile.price != null && (
            <span className="font-mono text-[6px] md:text-[7px] text-[#d4a843]/80 mt-0.5">
              {formatInr(tile.price)}
            </span>
          )}
        </div>
      ) : (
        /* Top / Bottom rows: stacked label */
        <div
          className={[
            "absolute inset-0 flex flex-col items-center text-center overflow-hidden px-0.5",
            isBottom ? "justify-end pb-[20%]" : "justify-start pt-[20%]",
          ].join(" ")}
        >
          <span className="font-sans text-[7px] md:text-[8.5px] font-semibold uppercase tracking-tight leading-tight text-white/90 w-full px-0.5 line-clamp-2">
            {tile.name}
          </span>
          {tile.price != null && (
            <span className="font-mono text-[6px] md:text-[7px] text-[#d4a843]/80 mt-0.5 leading-none">
              {formatInr(tile.price)}
            </span>
          )}
          {devBadge && (
            <span
              className="mt-0.5 text-[5px] md:text-[6px] uppercase tracking-wide font-bold leading-none px-0.5 py-px rounded-sm"
              style={{ background: groupColor ?? "#555", color: "#000" }}
            >
              {devBadge}
            </span>
          )}
          {isMortgaged && (
            <span className="text-[5px] font-mono text-[#8b2335] uppercase leading-none mt-0.5">
              MTG
            </span>
          )}
        </div>
      )}

      {children}
    </button>
  );
}
