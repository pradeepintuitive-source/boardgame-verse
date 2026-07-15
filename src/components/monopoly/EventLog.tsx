import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MonopolyLog } from "../../models/monopoly";

const COLLAPSED_COUNT = 3;

export function EventLog({ log, compact = false }: { log: MonopolyLog[]; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    if (expanded || log.length <= COLLAPSED_COUNT) return log;
    return log.slice(-COLLAPSED_COUNT);
  }, [expanded, log]);

  const hiddenCount = Math.max(0, log.length - COLLAPSED_COUNT);

  useEffect(() => {
    if (!expanded) return;
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [log.length, expanded]);

  return (
    <div
      className={`glass-panel border border-white/10 ${compact ? "p-2" : "p-3"} flex flex-col ${
        expanded ? "min-h-0 flex-1" : "shrink-0"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent-cyan">
          Game Log
        </div>
        {log.length > COLLAPSED_COUNT ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[8px] font-mono uppercase tracking-widest text-white/50 hover:text-accent-cyan flex items-center gap-0.5"
          >
            {expanded ? (
              <>
                Collapse <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                +{hiddenCount} more <ChevronDown className="size-3" />
              </>
            )}
          </button>
        ) : null}
      </div>
      <div
        ref={ref}
        className={`space-y-0.5 text-[10px] font-mono pr-1 ${
          expanded ? "overflow-y-auto min-h-0 flex-1 max-h-48" : "overflow-hidden"
        }`}
      >
        {visible.length === 0 ? (
          <div className="text-white/30 text-[9px]">No events yet.</div>
        ) : (
          visible.map((l) => (
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
          ))
        )}
      </div>
    </div>
  );
}
