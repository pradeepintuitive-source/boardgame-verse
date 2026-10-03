import { motion } from "framer-motion";
import { Skull } from "lucide-react";
import { Avatar } from "../common/Avatar";
import type { MafiaPlayer } from "../../models";

interface Props {
  player: MafiaPlayer;
  isMe?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  voteCount?: number;
}

export function PlayerSeat({ player, isMe, selectable, selected, onSelect, voteCount }: Props) {
  return (
    <motion.button
      layout
      whileHover={selectable ? { y: -4 } : {}}
      whileTap={selectable ? { scale: 0.97 } : {}}
      disabled={!selectable}
      onClick={onSelect}
      className={`relative flex items-center gap-3 p-3 glass-panel border text-left transition-all w-full
        ${player.alive ? "border-white/10" : "border-destructive/30 grayscale opacity-50"}
        ${selectable ? "cursor-pointer hover:border-accent-cyan/60" : ""}
        ${selected ? "border-accent-cyan ring-2 ring-accent-cyan/50" : ""}
      `}
    >
      <Avatar name={player.username} color={player.avatarColor} size={40} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm truncate text-white">{player.username}</span>
          {isMe && (
            <span className="text-[9px] font-mono uppercase text-accent-cyan border border-accent-cyan/40 px-1">
              YOU
            </span>
          )}
          {player.isAI && (
            <span className="text-[9px] font-mono uppercase text-white/40 border border-white/20 px-1">
              AI
            </span>
          )}
        </div>
        <div className="text-[10px] font-mono uppercase text-white/40">
          {player.alive ? "ALIVE" : `DEAD · ${player.role.toUpperCase()}`}
        </div>
      </div>
      {voteCount != null && voteCount > 0 && (
        <div className="px-2 py-1 bg-accent-pink/20 border border-accent-pink/40 text-accent-pink font-mono text-xs">
          {voteCount}
        </div>
      )}
      {!player.alive && <Skull className="size-5 text-destructive/70" />}
    </motion.button>
  );
}
