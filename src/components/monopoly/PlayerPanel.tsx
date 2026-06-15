import { Lock, Bot } from "lucide-react";
import { BOARD, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyState, MonopolyPlayer } from "../../models/monopoly";

export function PlayerPanel({
  state,
  player,
  isCurrent,
  isMe,
  onSelectTile,
  onProposeTrade,
}: {
  state: MonopolyState;
  player: MonopolyPlayer;
  isCurrent: boolean;
  isMe: boolean;
  onSelectTile?: (idx: number) => void;
  onProposeTrade?: () => void;
}) {
  const props = Object.entries(state.properties)
    .filter(([, p]) => p.ownerId === player.id)
    .map(([i]) => +i);

  return (
    <div
      className={`glass-panel p-3 border ${isCurrent ? "border-accent-cyan/60 shadow-[0_0_20px_rgba(0,242,255,0.2)]" : "border-white/10"} ${player.bankrupt ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="size-6 rounded-full border-2 border-white/60" style={{ background: player.avatarColor }} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate flex items-center gap-1">
            {player.username}
            {player.isAI && <Bot className="size-3 text-accent-cyan" />}
            {isMe && <span className="text-[9px] font-mono text-accent-cyan">(YOU)</span>}
          </div>
          <div className="text-[10px] font-mono text-accent-amber">${player.cash.toLocaleString()}</div>
        </div>
        {player.inJail && <Lock className="size-3.5 text-destructive" />}
      </div>
      {props.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {props.map((i) => {
            const tile = BOARD[i];
            const color = tile.group ? GROUP_COLORS[tile.group] : "#666";
            return (
              <button
                key={i}
                onClick={() => onSelectTile?.(i)}
                className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm hover:scale-110 transition-transform"
                style={{ background: `${color}30`, color, border: `1px solid ${color}` }}
                title={tile.name}
              >
                {tile.name.slice(0, 6)}
              </button>
            );
          })}
        </div>
      )}
      {player.jailCards > 0 && (
        <div className="text-[9px] font-mono text-accent-amber mt-1">🎫 {player.jailCards} Jail Card</div>
      )}
      {onProposeTrade && !isMe && !player.bankrupt && (
        <button
          onClick={onProposeTrade}
          className="mt-2 w-full text-[9px] font-mono uppercase tracking-widest border border-white/20 py-1 hover:border-accent-pink hover:text-accent-pink"
        >
          Propose Trade
        </button>
      )}
    </div>
  );
}