import { Lock, Bot, TrendingUp } from "lucide-react";
import { BOARD, GROUP_COLORS } from "../../data/monopolyBoard";
import type { MonopolyState, MonopolyPlayer } from "../../models/monopoly";
import { formatInr } from "../../utils/monopolyEngine";
import { Token } from "./Token";

export function PlayerPanel({
  state,
  player,
  playerIndex,
  isCurrent,
  isMe,
  onSelectTile,
  onProposeTrade,
}: {
  state: MonopolyState;
  player: MonopolyPlayer;
  playerIndex: number;
  isCurrent: boolean;
  isMe: boolean;
  onSelectTile?: (idx: number) => void;
  onProposeTrade?: () => void;
}) {
  const ownedIndices = Object.entries(state.properties)
    .filter(([, p]) => p.ownerId === player.id)
    .map(([i]) => +i);

  const developedCount = ownedIndices.filter((index) => (state.properties[index]?.houses ?? 0) > 0).length;
  // Net worth = cash + property values + improvement values
  const propWorth = ownedIndices.reduce((acc, i) => {
    const tile = BOARD[i];
    const property = state.properties[i];
    const improvementLevels = property?.houses === 5 ? 5 : property?.houses ?? 0;
    return acc + (tile.price ?? 0) + (tile.housePrice ?? 0) * improvementLevels;
  }, 0);
  const netWorth = player.cash + propWorth;

  const curTile = BOARD[player.position];

  return (
    <div
      className={[
        "relative rounded-sm border transition-all duration-300 overflow-hidden",
        isCurrent
          ? "border-[#d4a843]/60 shadow-[0_0_20px_rgba(212,168,67,0.2),0_0_0_1px_rgba(212,168,67,0.15)]"
          : "border-[rgba(212,168,67,0.1)]",
        player.bankrupt ? "opacity-40" : "",
        isCurrent ? "bg-[#1a1508]" : "bg-[#12121a]",
      ].join(" ")}
    >
      {/* Active player top indicator bar */}
      {isCurrent && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#d4a843]" />}

      <div className="p-3">
        {/* Header row: token + name + status */}
        <div className="flex items-center gap-2.5 mb-2">
          <Token
            color={player.avatarColor}
            label={player.username}
            playerIndex={playerIndex}
            size="md"
            isCurrent={isCurrent}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold truncate text-white/95">{player.username}</span>
              {player.isAI && <Bot className="size-3 text-[#9baab8] shrink-0" />}
              {isMe && (
                <span
                  className="text-[9px] font-mono uppercase tracking-wider px-1 rounded-sm shrink-0"
                  style={{ background: "rgba(212,168,67,0.15)", color: "#d4a843" }}
                >
                  YOU
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono font-bold" style={{ color: "#d4a843" }}>
              {formatInr(player.cash)}
            </div>
          </div>
          {player.inJail && (
            <Lock className="size-3.5 text-[#e05060] shrink-0" aria-label="In jail" />
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-2 text-[10px] font-mono text-[#9baab8]">
          <span title="Properties owned">
            {ownedIndices.length} prop{ownedIndices.length !== 1 ? "s" : ""}
          </span>
          {developedCount > 0 && (
            <>
              <span>·</span>
              <span title="Developed properties">{developedCount} dev</span>
            </>
          )}
          <span>·</span>
          <span className="flex items-center gap-0.5" title="Net worth">
            <TrendingUp className="size-2.5" />
            {formatInr(netWorth)}
          </span>
          {curTile && (
            <>
              <span>·</span>
              <span className="truncate max-w-[80px]" title={`On: ${curTile.name}`}>
                {curTile.name}
              </span>
            </>
          )}
        </div>

        {/* Property chips grouped by color */}
        {ownedIndices.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {ownedIndices.map((i) => {
              const tile = BOARD[i];
              const color = tile.group ? GROUP_COLORS[tile.group] : "#666";
              const prop = state.properties[i];
              return (
                <button
                  key={i}
                  onClick={() => onSelectTile?.(i)}
                  className="min-h-[28px] text-[8px] font-sans font-semibold px-1.5 py-0.5 rounded-sm hover:scale-105 transition-transform"
                  style={{
                    background: `${color}25`,
                    color,
                    border: `1px solid ${color}60`,
                    maxWidth: "56px",
                  }}
                  title={tile.name}
                >
                  <span className="block truncate">{tile.name}</span>
                  {prop?.houses > 0 && (
                    <span className="block text-[6px] opacity-80">
                      {"●".repeat(Math.min(prop.houses, 5))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Jail card */}
        {player.jailCards > 0 && (
          <div className="text-[9px] font-mono text-[#c87941] mb-1">
            🎫 {player.jailCards} Get Out of Jail
          </div>
        )}

        {/* Trade button */}
        {onProposeTrade && !isMe && !player.bankrupt && (
          <button
            onClick={onProposeTrade}
            className="mt-1 w-full min-h-[36px] text-[9px] font-sans font-semibold uppercase tracking-widest border border-white/15 py-1.5 rounded-sm hover:border-[#d4a843]/50 hover:text-[#d4a843] transition-colors"
          >
            Propose Trade
          </button>
        )}
      </div>
    </div>
  );
}
