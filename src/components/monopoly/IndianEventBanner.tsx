import type { ActiveIndianEvent } from "../../data/indianEvents";

interface Props {
  event: ActiveIndianEvent | null;
}

export function IndianEventBanner({ event }: Props) {
  if (!event) return null;
  return (
    <div className="glass-panel border border-accent-amber/40 px-4 py-3 mb-4">
      <div className="text-[9px] font-mono uppercase tracking-[0.35em] text-accent-amber mb-1">
        Indian Event Active
      </div>
      <div className="font-display text-2xl italic uppercase text-white leading-none mb-1">
        {event.title}
      </div>
      <p className="text-xs text-white/70 font-mono">{event.description}</p>
    </div>
  );
}
