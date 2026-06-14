import { Gavel } from "lucide-react";
import type { MafiaPlayer } from "../../models";
import { PlayerSeat } from "./PlayerSeat";
import { NeonButton } from "../common/NeonButton";

interface Props {
  me: MafiaPlayer;
  players: MafiaPlayer[];
  onVote: (targetId: string) => void;
  onResolve: () => void;
}

export function VotingPanel({ me, players, onVote, onResolve }: Props) {
  const tally: Record<string, number> = {};
  players.forEach((p) => {
    if (p.alive && p.votedFor) tally[p.votedFor] = (tally[p.votedFor] ?? 0) + 1;
  });
  const alive = players.filter((p) => p.alive);
  const canVote = me.alive && !me.votedFor;

  return (
    <div className="glass-panel border border-accent-cyan/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gavel className="size-4 text-accent-cyan" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan">
          Voting · Day Phase
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {alive
          .filter((p) => p.id !== me.id)
          .map((p) => (
            <PlayerSeat
              key={p.id}
              player={p}
              selectable={canVote}
              selected={me.votedFor === p.id}
              onSelect={() => onVote(p.id)}
              voteCount={tally[p.id] ?? 0}
            />
          ))}
      </div>
      <NeonButton variant="cyan" size="md" onClick={onResolve} className="w-full">
        Tally Votes
      </NeonButton>
    </div>
  );
}