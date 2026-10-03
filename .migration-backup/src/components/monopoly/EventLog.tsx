import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MonopolyLog } from "../../models/monopoly";

const COLLAPSED_COUNT = 3;

function lineColor(kind: MonopolyLog["kind"]) {
  switch (kind) {
    case "money":
      return "text-accent-amber";
    case "event":
      return "text-accent-pink";
    case "trade":
      return "text-accent-cyan";
    default:
      return "text-white/55";
  }
}

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
      className={`rounded-sm border border-white/10 bg-black/35 ${compact ? "p-1.5" : "p-2.5"} flex flex-col ${
        expanded ? "min-h-0 flex-1" : "shrink-0"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
        <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-[0.28em] text-white/45">
          <ScrollText className="size-3 text-accent-cyan" />
          Log
        </div>
        {log.length > COLLAPSED_COUNT ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[8px] font-mono uppercase tracking-widest text-white/40 hover:text-accent-cyan flex items-center gap-0.5 transition-colors"
          >
            {expanded ? (
              <>
                Less <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                +{hiddenCount} <ChevronDown className="size-3" />
              </>
            )}
          </button>
        ) : null}
      </div>
      <div
        ref={ref}
        className={`space-y-0.5 text-[9px] font-mono leading-snug pr-0.5 ${
          expanded ? "overflow-y-auto min-h-0 flex-1 max-h-40" : "overflow-hidden max-h-[3.6rem]"
        }`}
      >
        {visible.length === 0 ? (
          <div className="text-white/25 text-[9px]">No events yet.</div>
        ) : (
          visible.map((l) => (
            <div key={l.id} className={`truncate ${lineColor(l.kind)}`} title={l.text}>
              <span className="text-white/25 mr-1">›</span>
              {l.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
