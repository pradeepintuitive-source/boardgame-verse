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
      { title: "GameHub — Play Bharat Business" },
      {
        name: "description",
        content:
          "Play Mafia and Bharat Business with friends or AI. Single-device, LAN, or online — premium board gaming for the modern arcade.",
      },
      { property: "og:title", content: "GameHub — Premium Multiplayer Board Gaming" },
      {
        property: "og:description",
        content:
          "Mafia & Bharat Business. Single-device, LAN, online. Premium board gaming reborn.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [resumeSession, setResumeSession] = useState<{
    roomId: string;
    sessionId: string;
    gameType: string;
  } | null>(null);

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
    return resumeSession.gameType === "monopoly" ? "Resume Bharat Business" : "Resume Game";
  }, [resumeSession]);

  return (
    <AppShell>
      <main className="relative flex flex-col items-center px-4 pb-28 pt-28 sm:px-6 sm:pt-32 sm:pb-32">
        <motion.section
          variants={pageFade}
          initial="hidden"
          animate="show"
          className="text-center mb-20 md:mb-24"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="mb-4 font-display text-5xl uppercase italic leading-none tracking-tighter text-white gold-text-glow sm:text-7xl md:text-9xl"
            style={{ animation: "flicker 3s ease-out both" }}
          >
            GameHub
          </motion.h1>
          <p className="mb-12 max-w-full px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#d4a843]/70 sm:text-xs sm:tracking-[0.28em] md:text-sm md:tracking-[0.4em]">
            Premium Digital Tabletop Experiences
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
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
          className="flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-6xl items-center md:items-start justify-center"
        >
          <motion.div variants={riseItem}>
            <GameCard
              title="Mafia"
              description="The original social deduction game. Find the imposters before they take over the city. Trust no one."
              players="6-12"
              duration="EST. 45 MIN"
              image={mafiaArt}
              accent="pink"
              badge="Available"
              to="/create-room?game=mafia"
            />
          </motion.div>
          <motion.div variants={riseItem}>
            <GameCard
              title="Bharat Business"
              description="The ultimate property trading game. Build your Bharat empire with Indian cities, ₹ currency, and a premium modern board."
              players="2-6"
              duration="EST. 90 MIN"
              image={monopolyArt}
              accent="cyan"
              badge="Top Rated"
              offset
              to="/create-room?game=monopoly"
            />
          </motion.div>
        </motion.div>
      </main>
    </AppShell>
  );
}
