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
  const titleHover =
    accent === "cyan" ? "group-hover:text-accent-cyan" : "group-hover:text-accent-pink";
  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className={`group relative w-full max-w-[420px] ${offset ? "md:mt-10" : ""}`}
    >
      <div
        className={`absolute -inset-3 ${glow} opacity-0 group-hover:opacity-20 blur-3xl transition-all duration-700 pointer-events-none rounded-[2rem]`}
      />
      <div className="relative flex h-full flex-col overflow-hidden glass-panel p-4">
        <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-neutral-900">
          <img
            src={image}
            alt={`${title} key art`}
            loading="lazy"
            width={800}
            height={600}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {badge && (
            <span
              className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${accent === "cyan" ? "bg-black/55 text-accent-cyan" : "bg-black/55 text-accent-pink"}`}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-3 px-2 mb-2">
          <h3 className={`font-display text-[2rem] leading-none uppercase italic transition-colors ${titleHover}`}>
            {title}
          </h3>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
            <Users className="size-3" /> {players}
          </span>
        </div>
        <p className="px-2 text-sm leading-relaxed text-white/65 mb-6 flex-grow">{description}</p>
        <div className="mt-auto flex items-center justify-between px-2 pb-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <Clock className="size-3.5" /> {duration}
          </div>
          <Link to={to as any}>
            <NeonButton variant={accent} size="sm">
              Play now
            </NeonButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
