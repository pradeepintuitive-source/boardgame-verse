import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
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
  return (
    <AppShell>
      <main className="relative flex flex-col items-center pt-32 pb-32 px-6">
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
            className="font-display text-7xl md:text-9xl tracking-tighter italic text-white neon-text-glow leading-none mb-4 uppercase"
            style={{ animation: "flicker 3s ease-out both" }}
          >
            GameHub
          </motion.h1>
          <p className="text-accent-cyan/60 font-mono text-xs md:text-sm tracking-[0.4em] uppercase mb-12">
            Digital Classics Pradeep &bull; Premium Board Gaming
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
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
              title="Monopoly"
              description="The ultimate property trading game. Build your empire and bankrupt your rivals in this neon-lit edition."
              players="2-6"
              duration="EST. 90 MIN"
              image={monopolyArt}
              accent="cyan"
              badge="Available"
              offset
              to="/create-room?game=monopoly"
            />
          </motion.div>
        </motion.div>
      </main>
    </AppShell>
  );
}
