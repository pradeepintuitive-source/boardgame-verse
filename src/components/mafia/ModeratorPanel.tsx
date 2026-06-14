import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import type { ModeratorMessage } from "../../models";

function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {shown}
      <span className="inline-block w-2 h-4 ml-0.5 bg-accent-cyan align-middle animate-[typewriter-blink_1s_steps(2)_infinite]" />
    </span>
  );
}

export function ModeratorPanel({ log }: { log: ModeratorMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log.length]);
  const latest = log[log.length - 1];

  return (
    <div className="glass-panel border border-accent-cyan/30 p-5 flex flex-col gap-3 max-h-[420px]">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Bot className="size-4 text-accent-cyan" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan">
          AI Moderator
        </span>
        <span className="ml-auto text-[9px] font-mono text-white/40">{log.length} EVENTS</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-3 text-sm">
        <AnimatePresence initial={false}>
          {log.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={
                m.kind === "announcement"
                  ? "text-white font-medium"
                  : m.kind === "rule"
                    ? "text-accent-cyan/80 italic"
                    : m.kind === "system"
                      ? "text-accent-amber/70 font-mono text-xs"
                      : "text-white/70"
              }
            >
              {i === log.length - 1 && m === latest ? <Typewriter text={m.text} /> : m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}