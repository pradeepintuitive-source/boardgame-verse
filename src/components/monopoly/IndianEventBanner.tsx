import type { ActiveIndianEvent } from "../../data/indianEvents";

interface Props {
  event: ActiveIndianEvent | null;
}

export function IndianEventBanner({ event }: Props) {
  if (!event) return null;
  return (
    <div className="glass-panel border border-accent-amber/40 px-3 py-1.5 shrink-0">
      <div className="text-[8px] font-mono uppercase tracking-[0.3em] text-accent-amber">
        Event · {event.title}
      </div>
      <p className="text-[10px] text-white/65 font-mono truncate">{event.description}</p>
    </div>
  );
}
