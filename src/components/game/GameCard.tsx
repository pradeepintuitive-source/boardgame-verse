import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { NeonButton } from "../common/NeonButton";

interface Props {
  title: string;
  description: string;
  players: string;
  duration: string;
  image: string;
  accent: "cyan" | "pink";
  offset?: boolean;
  to: string;
  badge?: string;
}

export function GameCard({
  title,
  description,
  players,
  duration,
  image,
  accent,
  offset,
  to,
  badge,
}: Props) {
  const glow = accent === "cyan" ? "bg-accent-cyan" : "bg-accent-pink";
  const titleHover = accent === "cyan" ? "group-hover:text-accent-cyan" : "group-hover:text-accent-pink";
  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className={`group relative w-full max-w-[400px] ${offset ? "md:translate-y-12" : ""}`}
    >
      <div className={`absolute -inset-1 ${glow} opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 pointer-events-none`} />
      <div className="relative aspect-[3/4] glass-panel border border-white/10 p-6 flex flex-col overflow-hidden">
        <div className="relative w-full aspect-[4/3] mb-6 overflow-hidden bg-neutral-900">
          <img
            src={image}
            alt={`${title} key art`}
            loading="lazy"
            width={800}
            height={600}
            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
          />
          {badge && (
            <span className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${accent === "cyan" ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40" : "bg-accent-pink/20 text-accent-pink border border-accent-pink/40"}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-display text-4xl uppercase italic transition-colors ${titleHover}`}>{title}</h3>
          <span className="font-mono text-[10px] border border-white/20 px-2 py-1 inline-flex items-center gap-1">
            <Users className="size-3" /> {players}
          </span>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
        <div className="flex justify-between items-end">
          <div className="font-mono text-[10px] text-white/40 inline-flex items-center gap-1">
            <Clock className="size-3" /> {duration}
          </div>
          <Link to={to as any}>
            <NeonButton variant={accent} size="sm">Play Now</NeonButton>
          </Link>
        </div>
        <div className="absolute inset-0 pointer-events-none scanlines opacity-10" />
      </div>
    </motion.div>
  );
}