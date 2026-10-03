import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { GameCard } from "../components/game/GameCard";
import { NeonButton } from "../components/common/NeonButton";
import { pageFade, riseItem, stagger } from "../animations/variants";
import mafiaArt from "../assets/mafia-art.jpg";
import monopolyArt from "../assets/monopoly-art.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GameHub — Premium Multiplayer Board Gaming" },
      {
        name: "description",
        content:
          "Play Mafia and Monopoly with friends or AI. Single-device, LAN, or online — premium board gaming for the modern arcade.",
      },
      { property: "og:title", content: "GameHub — Premium Multiplayer Board Gaming" },
      {
        property: "og:description",
        content: "Mafia & Monopoly. Single-device, LAN, online. Premium board gaming reborn.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [resumeSession, setResumeSession] = useState<{ roomId: string; sessionId: string; gameType: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gamehub:resume-session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.sessionId) {
          setResumeSession(parsed);
        }
      }
    } catch {
      setResumeSession(null);
    }
  }, []);

  const resumeLabel = useMemo(() => {
    if (!resumeSession) return null;
    return resumeSession.gameType === "monopoly" ? "Resume Monopoly" : "Resume Game";
  }, [resumeSession]);

  return (
    <AppShell>
      <main className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-28">
        <motion.section
          variants={pageFade}
          initial="hidden"
          animate="show"
          className="mb-14 text-center md:mb-16"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-accent-cyan">
            Mafia and Monopoly
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-6xl leading-[0.9] tracking-tight text-white uppercase italic md:text-8xl"
          >
            GameHub
          </motion.h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
            Host a table in a few clicks. Play on one device, over the local network, or online
            with friends and AI.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {resumeSession && resumeLabel ? (
              <Link to="/monopoly/$gameId" params={{ gameId: resumeSession.sessionId }}>
                <NeonButton size="lg">{resumeLabel}</NeonButton>
              </Link>
            ) : null}
            <Link to="/create-room">
              <NeonButton size="lg">Create Room</NeonButton>
            </Link>
            <Link to="/join-room">
              <NeonButton variant="ghost" size="lg">
                Join Game
              </NeonButton>
            </Link>
          </div>
        </motion.section>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex w-full flex-col items-stretch justify-center gap-6 md:flex-row md:items-start md:gap-8"
        >
          <motion.div variants={riseItem}>
            <GameCard
              title="Mafia"
              description="The original social deduction game. Find the imposters before they take over the city. Trust no one."
              players="6-12"
              duration="About 45 min"
              image={mafiaArt}
              accent="pink"
              badge="Available"
              to="/create-room?game=mafia"
            />
          </motion.div>
          <motion.div variants={riseItem}>
            <GameCard
              title="Monopoly: India Edition"
              description="The ultimate property trading game. Build your Bharat empire with Indian cities, ₹ currency, and a modern India-themed board."
              players="2-6"
              duration="About 90 min"
              image={monopolyArt}
              accent="cyan"
              badge="Available"
              to="/create-room?game=monopoly"
            />
          </motion.div>
        </motion.div>
      </main>
    </AppShell>
  );
}
