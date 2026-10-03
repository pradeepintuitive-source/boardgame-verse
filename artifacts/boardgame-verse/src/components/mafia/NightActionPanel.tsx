import { Moon } from "lucide-react";
import type { MafiaPlayer, MafiaRole } from "../../models";
import { PlayerSeat } from "./PlayerSeat";
import { NeonButton } from "../common/NeonButton";

interface Props {
  me: MafiaPlayer;
  players: MafiaPlayer[];
  selectedTargetId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
}

const ROLE_PROMPT: Record<MafiaRole, string> = {
  mafia: "Choose a citizen to eliminate.",
  detective: "Choose a player to investigate.",
  doctor: "Choose a player to protect.",
  villager: "Sleep. The night belongs to others.",
};

export function NightActionPanel({ me, players, selectedTargetId, onSelect, onConfirm }: Props) {
  const canAct = me.alive && me.role !== "villager";
  const targets = players.filter((p) => p.alive && p.id !== me.id);

  return (
    <div className="glass-panel border border-accent-pink/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Moon className="size-4 text-accent-pink" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent-pink">
          Night Action
        </span>
      </div>
      <p className="text-sm text-white/70 mb-4 italic">{ROLE_PROMPT[me.role]}</p>

      {canAct ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {targets.map((p) => (
              <PlayerSeat
                key={p.id}
                player={p}
                selectable
                selected={selectedTargetId === p.id}
                onSelect={() => onSelect(p.id)}
              />
            ))}
          </div>
          <NeonButton
            variant="pink"
            size="md"
            disabled={!selectedTargetId}
            onClick={onConfirm}
            className="w-full"
          >
            Confirm Action
          </NeonButton>
        </>
      ) : (
        <NeonButton variant="ghost" size="md" onClick={onConfirm} className="w-full">
          Skip to morning
        </NeonButton>
      )}
    </div>
  );
}
