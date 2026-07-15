import { useEffect, useRef } from "react";
import type { MonopolyLog } from "../../models/monopoly";

export function EventLog({ log, compact = false }: { log: MonopolyLog[]; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [log.length]);
  return (
    <div className={`glass-panel border border-white/10 ${compact ? "p-2" : "p-4"} flex-1 min-h-0 flex flex-col`}>
      <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent-cyan mb-1.5 shrink-0">
        Game Log
      </div>
      <div
        ref={ref}
        className={`space-y-0.5 text-[10px] font-mono overflow-y-auto pr-1 min-h-0 flex-1`}
      >
        {log.map((l) => (
          <div
            key={l.id}
            className={
              l.kind === "money"
                ? "text-accent-amber"
                : l.kind === "event"
                  ? "text-accent-pink"
                  : l.kind === "trade"
                    ? "text-accent-cyan"
                    : "text-white/60"
            }
          >
            › {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
