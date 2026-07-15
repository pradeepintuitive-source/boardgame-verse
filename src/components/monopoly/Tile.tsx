import type { ReactNode } from "react";
import { GROUP_COLORS, shortTileName } from "../../data/monopolyBoard";
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
  /** Deed owned by focused player card */
  focusOwned?: boolean;
  /** Focused player's current board position */
  focusPosition?: boolean;
  focusColor?: string;
}

export function Tile({
  tile,
  prop,
  ownerColor,
  orientation,
  onClick,
  children,
  highlight,
  focusOwned,
  focusPosition,
  focusColor = "#00f2ff",
}: Props) {
  const isCorner = orientation === "corner";
  const groupBar = tile.group ? GROUP_COLORS[tile.group] : null;
  const barPos =
    orientation === "top"
      ? "bottom"
      : orientation === "bottom"
        ? "top"
        : orientation === "left"
          ? "right"
          : "left";
  const isVerticalBar = orientation === "left" || orientation === "right";
  const label = shortTileName(tile);

  const ringClass = focusPosition
    ? "ring-2 ring-offset-1 ring-offset-transparent"
    : focusOwned
      ? "ring-2"
      : highlight
        ? "ring-2 ring-accent-cyan"
        : "";

  return (
    <button
      type="button"
      title={tile.name}
      onClick={onClick}
      className={`relative w-full h-full glass-panel border border-white/10 p-1 text-left flex flex-col overflow-hidden hover:border-accent-cyan/60 transition-colors ${ringClass}`}
      style={
        focusOwned || focusPosition
          ? {
              boxShadow: focusPosition
                ? `0 0 0 2px ${focusColor}, 0 0 18px ${focusColor}`
                : `0 0 0 2px ${focusColor}, inset 0 0 24px ${focusColor}44`,
              borderColor: `${focusColor}aa`,
            }
          : undefined
      }
    >
      {groupBar && (
        <div
          className={`absolute ${barPos === "top" ? "top-0 left-0 right-0 h-2" : barPos === "bottom" ? "bottom-0 left-0 right-0 h-2" : barPos === "left" ? "top-0 bottom-0 left-0 w-2" : "top-0 bottom-0 right-0 w-2"}`}
          style={{ background: groupBar }}
        />
      )}
      {ownerColor && !groupBar && (
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: ownerColor }} />
      )}
      <div
        className={`relative z-10 flex-1 flex flex-col ${isCorner ? "items-center justify-center text-center" : isVerticalBar ? "items-center justify-center text-center px-0.5" : "items-center justify-end text-center px-0.5 pb-1"}`}
      >
        <div
          className={`font-mono uppercase tracking-tight leading-tight line-clamp-2 ${isCorner ? "text-[11px]" : "text-[10px]"} text-white/90`}
        >
          {label}
        </div>
        {tile.price != null && (
          <div className="text-[9px] font-mono text-accent-cyan/80 mt-0.5">
            {formatInr(tile.price ?? 0)}
          </div>
        )}
        {prop?.mortgaged && <div className="text-[8px] font-mono text-destructive">MTG</div>}
        {prop && prop.houses > 0 && prop.houses < 5 && (
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: prop.houses }).map((_, i) => (
              <div key={i} className="size-1.5 bg-accent-amber rounded-sm" />
            ))}
          </div>
        )}
        {prop?.houses === 5 && <div className="size-2 bg-destructive rounded-sm mt-0.5" />}
        {ownerColor && (
          <div
            className="size-1.5 rounded-full mt-0.5"
            style={{ background: ownerColor, boxShadow: `0 0 6px ${ownerColor}` }}
          />
        )}
      </div>
      {children}
    </button>
  );
}
