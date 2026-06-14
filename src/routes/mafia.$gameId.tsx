import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Moon, Sun, Trophy } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { RoleCard } from "../components/mafia/RoleCard";
import { PlayerSeat } from "../components/mafia/PlayerSeat";
import { NightActionPanel } from "../components/mafia/NightActionPanel";
import { VotingPanel } from "../components/mafia/VotingPanel";
import { ModeratorPanel } from "../components/mafia/ModeratorPanel";
import { ChatDrawer } from "../components/chat/ChatDrawer";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import {
  beginVoting,
  castVote,
  resolveNight,
  resolveVoting,
} from "../utils/mafiaEngine";

export const Route = createFileRoute("/mafia/$gameId")({
  head: () => ({
    meta: [{ title: "Mafia — GameHub" }, { name: "description", content: "Play Mafia with friends and AI." }],
  }),
  component: MafiaPage,
});

function MafiaPage() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const state = useGameStore((s) => s.mafia[gameId]);
  const patch = useGameStore((s) => s.patchMafia);
  const setMafia = useGameStore((s) => s.setMafia);
  const user = useAuthStore((s) => s.user);

  const [target, setTarget] = useState<string | null>(null);
  const [showRole, setShowRole] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowRole(false), 4200);
    return () => clearTimeout(t);
  }, [gameId]);

  const me = useMemo(
    () => state?.players.find((p) => p.id === user?.id) ?? state?.players[0],
    [state, user],
  );

  if (!state || !me) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32 text-center">
          <div>
            <p className="text-white/60 mb-6 font-mono">This match has ended or was lost.</p>
            <NeonButton onClick={() => navigate({ to: "/" })}>Back Home</NeonButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const isNight = state.phase === "night";
  const isVoting = state.phase === "voting";
  const isDay = state.phase === "day";
  const isEnded = state.phase === "ended";

  const confirmNight = () => {
    const actions = { ...state.nightActions };
    if (me.role !== "villager" && target) actions[me.id] = target;
    const next = resolveNight({ ...state, nightActions: actions });
    setMafia(gameId, next);
    setTarget(null);
  };

  const beginVote = () => setMafia(gameId, beginVoting(state));
  const vote = (id: string) => patch(gameId, castVote(state, me.id, id));
  const resolveVote = () => setMafia(gameId, resolveVoting(state));

  return (
    <AppShell hideChrome>
      {/* Day/Night atmosphere */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 transition-colors duration-1000"
        style={{
          background: isNight
            ? "radial-gradient(circle at 50% 0%, #1a0633 0%, #050507 60%)"
            : isVoting || isDay
              ? "radial-gradient(circle at 50% 0%, #0a1f2e 0%, #050507 60%)"
              : "var(--gradient-radial-glow)",
        }}
      />

      {/* Floating moon/sun */}
      <motion.div
        key={state.phase}
        initial={{ opacity: 0, y: -40, scale: 0.8 }}
        animate={{ opacity: 0.6, y: 0, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
        className="fixed top-12 right-12 pointer-events-none"
      >
        {isNight ? (
          <Moon className="size-32 text-accent-pink drop-shadow-[0_0_40px_rgba(255,0,229,0.6)]" />
        ) : (
          <Sun className="size-32 text-accent-cyan drop-shadow-[0_0_40px_rgba(0,242,255,0.6)]" />
        )}
      </motion.div>

      {/* Role reveal overlay */}
      <AnimatePresence>
        {showRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md grid place-items-center px-6"
            onClick={() => setShowRole(false)}
          >
            <div className="text-center">
              <RoleCard role={me.role} />
              <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.4em] text-white/40">
                Tap anywhere to continue
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative px-6 pt-10 pb-32 max-w-7xl mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-1">
              Round {state.round} · {state.phase}
            </div>
            <h1 className="font-display text-5xl md:text-7xl italic uppercase neon-text-glow">
              {isNight ? "Night Falls" : isVoting ? "Cast Your Vote" : isDay ? "Daybreak" : "Match Over"}
            </h1>
          </div>
          <button
            onClick={() => setShowRole(true)}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-white/20 hover:border-accent-cyan"
          >
            View My Role
          </button>
        </header>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <section className="space-y-6">
            {/* All players */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">
                Players · {state.players.filter((p) => p.alive).length} alive
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {state.players.map((p) => (
                  <PlayerSeat key={p.id} player={p} isMe={p.id === me.id} />
                ))}
              </div>
            </div>

            {/* Phase panel */}
            {isNight && (
              <NightActionPanel
                me={me}
                players={state.players}
                selectedTargetId={target}
                onSelect={setTarget}
                onConfirm={confirmNight}
              />
            )}
            {isDay && (
              <div className="glass-panel border border-accent-cyan/20 p-6 text-center">
                <p className="text-white/70 mb-4">
                  Discuss. Suspect. When the town is ready, begin the vote.
                </p>
                <NeonButton variant="cyan" onClick={beginVote}>Begin Voting</NeonButton>
              </div>
            )}
            {isVoting && (
              <VotingPanel me={me} players={state.players} onVote={vote} onResolve={resolveVote} />
            )}
            {isEnded && (
              <div className="glass-panel border border-accent-amber/40 p-8 text-center">
                <Trophy className="size-12 text-accent-amber mx-auto mb-4" />
                <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-amber mb-2">
                  {state.winner === "mafia" ? "Mafia Victory" : "Villager Victory"}
                </div>
                <h2 className="font-display text-4xl italic uppercase mb-6">
                  {state.winner === "mafia" ? "The town has fallen." : "Justice prevails."}
                </h2>
                <NeonButton onClick={() => navigate({ to: "/" })}>Return to Lobby</NeonButton>
              </div>
            )}
          </section>

          <aside>
            <ModeratorPanel log={state.log} />
          </aside>
        </div>
      </main>

      <ChatDrawer roomId={gameId} />
    </AppShell>
  );
}