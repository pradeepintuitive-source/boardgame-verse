import { Sparkles } from "lucide-react";
import type { ActiveIndianEvent } from "../../data/indianEvents";

interface Props {
  event: ActiveIndianEvent | null;
  /** Inline chip for the header row (default). */
  inline?: boolean;
}

export function IndianEventBanner({ event, inline = true }: Props) {
  if (!event) return null;

  if (inline) {
    return (
      <div
        className="min-w-0 max-w-md flex items-center gap-1.5 rounded-sm border border-accent-amber/35 bg-accent-amber/10 px-2 py-0.5"
        title={event.description}
      >
        <Sparkles className="size-3 text-accent-amber shrink-0" />
        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-accent-amber font-bold shrink-0">
          {event.title}
        </span>
        <span className="text-[9px] font-mono text-white/45 truncate">{event.description}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 border border-accent-amber/30 bg-accent-amber/[0.07] px-2.5 py-1 shrink-0 rounded-sm"
      title={event.description}
    >
      <Sparkles className="size-3 text-accent-amber shrink-0" />
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent-amber font-bold shrink-0">
        {event.title}
      </span>
      <span className="text-[9px] font-mono text-white/50 truncate">{event.description}</span>
    </div>
  );
}
