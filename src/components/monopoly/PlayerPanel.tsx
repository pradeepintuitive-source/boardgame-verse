import { Lock, Bot } from "lucide-react";
import { BOARD, GROUP_COLORS, shortTileName } from "../../data/monopolyBoard";
import type { MonopolyState, MonopolyPlayer } from "../../models/monopoly";
import { formatInr } from "../../utils/monopolyEngine";

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
}) {
  const props = Object.entries(state.properties)
    .filter(([, p]) => p.ownerId === player.id)
    .map(([i]) => +i);

  const tileName = BOARD[player.position]?.name ?? `Tile ${player.position}`;

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
      className={`glass-panel p-3 border cursor-pointer transition-shadow ${
        selected
          ? "border-transparent shadow-[0_0_24px_rgba(0,242,255,0.35)]"
          : isCurrent
            ? "border-accent-cyan/60 shadow-[0_0_20px_rgba(0,242,255,0.2)]"
            : "border-white/10 hover:border-white/25"
      } ${player.bankrupt ? "opacity-40" : ""}`}
      style={
        selected
          ? {
              boxShadow: `0 0 0 2px ${player.avatarColor}, 0 0 20px ${player.avatarColor}66`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="relative shrink-0">
          <div
            className="size-7 rounded-full border-2 border-white/70 grid place-items-center font-mono text-[11px] font-bold text-black"
            style={{ background: player.avatarColor, boxShadow: `0 0 10px ${player.avatarColor}` }}
          >
            {player.username.slice(0, 1).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-black border border-white/40 grid place-items-center text-[8px] font-mono text-white">
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
          <div className="text-[9px] font-mono text-white/40 truncate" title={tileName}>
            At {tileName}
          </div>
        </div>
        {player.inJail && <Lock className="size-3.5 text-destructive" />}
      </div>
      {selected ? (
        <div
          className="text-[9px] font-mono uppercase tracking-widest mb-2"
          style={{ color: player.avatarColor }}
        >
          Highlighting deeds & position
        </div>
      ) : null}
      {props.length > 0 && (
        <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
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
                className="flex items-center gap-2 text-left text-[10px] font-mono px-1.5 py-1 hover:brightness-125"
                style={{ background: `${color}18`, borderLeft: `3px solid ${color}` }}
                title={tile.name}
              >
                <span className="flex-1 truncate" style={{ color }}>
                  {shortTileName(tile)}
                </span>
                {prop?.mortgaged ? (
                  <span className="text-destructive text-[9px]">MTG</span>
                ) : houses >= 5 ? (
                  <span className="size-2 bg-destructive rounded-sm" />
                ) : houses > 0 ? (
                  <span className="flex gap-0.5">
                    {Array.from({ length: houses }).map((_, h) => (
                      <span key={h} className="size-1.5 bg-accent-amber rounded-sm" />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
      {player.jailCards > 0 && (
        <div className="text-[9px] font-mono text-accent-amber mt-1">
          {player.jailCards} Jail Card
        </div>
      )}
      {onProposeTrade && !isMe && !player.bankrupt && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onProposeTrade();
          }}
          className="mt-2 w-full text-[9px] font-mono uppercase tracking-widest border border-white/20 py-1 hover:border-accent-pink hover:text-accent-pink"
        >
          Propose Trade
        </button>
      )}
    </div>
  );
}
