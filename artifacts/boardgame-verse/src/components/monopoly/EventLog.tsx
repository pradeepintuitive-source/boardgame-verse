import { useEffect, useRef } from "react";
import { History } from "lucide-react";
import type { MonopolyLog } from "../../models/monopoly";

export function EventLog({ log }: { log: MonopolyLog[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure render is complete before scrolling
    const t = setTimeout(() => {
      ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [log.length]);

  return (
    <div
      className="rounded-sm border border-[rgba(212,168,67,0.15)] bg-[#12121a] flex flex-col h-full max-h-[300px]"
      role="log"
      aria-label="Game activity log"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(212,168,67,0.1)] shrink-0">
        <History className="size-3.5 text-[#d4a843]" />
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#d4a843]">
          Activity Log
        </div>
      </div>

      <div
        ref={ref}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs font-mono scroll-smooth"
      >
        {log.length === 0 ? (
          <div className="text-[#9baab8] text-[10px] italic">
            Game started. Waiting for moves...
          </div>
        ) : (
          log.map((l) => {
            const isMoney = l.kind === "money";
            const isEvent = l.kind === "event";
            const isTrade = l.kind === "trade";
            const isImportant = isEvent || l.text.includes("Bankrupt") || l.text.includes("winner");

            return (
              <div
                key={l.id}
                className={[
                  "leading-relaxed transition-colors",
                  isMoney
                    ? "text-[#c87941]"
                    : isEvent
                      ? "text-[#8b2335] font-bold"
                      : isTrade
                        ? "text-[#2a5f3f]"
                        : isImportant
                          ? "text-[#d4a843] font-bold"
                          : "text-[#9baab8]",
                ].join(" ")}
              >
                <span className="opacity-50 mr-2">›</span>
                {l.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
