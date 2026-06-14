import { motion } from "framer-motion";
import { Eye, Heart, Shield, Skull } from "lucide-react";
import type { MafiaRole } from "../../models";

const ROLE_META: Record<MafiaRole, { icon: typeof Skull; label: string; tagline: string; color: string }> = {
  mafia: { icon: Skull, label: "Mafia", tagline: "Eliminate the town. Win at any cost.", color: "#ff00e5" },
  detective: { icon: Eye, label: "Detective", tagline: "Each night, investigate one player.", color: "#00f2ff" },
  doctor: { icon: Heart, label: "Doctor", tagline: "Each night, save one soul.", color: "#4ade80" },
  villager: { icon: Shield, label: "Villager", tagline: "Find the Mafia. Vote them out.", color: "#facc15" },
};

export function RoleCard({ role }: { role: MafiaRole }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotateY: -20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="relative glass-panel p-8 border-2 max-w-sm"
      style={{ borderColor: `${meta.color}80`, boxShadow: `0 0 40px ${meta.color}40` }}
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 mb-2">
        Your Role
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Icon className="size-12" style={{ color: meta.color }} />
        <div>
          <div
            className="font-display text-5xl uppercase italic"
            style={{ color: meta.color, textShadow: `0 0 18px ${meta.color}` }}
          >
            {meta.label}
          </div>
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">{meta.tagline}</p>
      <div className="absolute inset-0 pointer-events-none scanlines opacity-10" />
    </motion.div>
  );
}