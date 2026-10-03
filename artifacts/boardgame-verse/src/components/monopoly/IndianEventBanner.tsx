import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import type { ActiveIndianEvent } from "../../data/indianEvents";

interface Props {
  event: ActiveIndianEvent | null;
}

export function IndianEventBanner({ event }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (event) {
      setShow(true);
      // Auto-hide after 15 seconds unless it's a permanent effect
      const t = setTimeout(() => setShow(false), 15000);
      return () => clearTimeout(t);
    } else {
      setShow(false);
      return undefined;
    }
  }, [event?.id]);

  return (
    <AnimatePresence>
      {show && event && (
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          className="relative max-w-lg mx-auto mb-6 p-[2px] rounded-sm overflow-hidden shadow-2xl"
          style={{ zIndex: 40 }}
        >
          {/* Animated gradient border */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#d4a843]/10 via-[#d4a843]/60 to-[#d4a843]/10"
            style={{
              backgroundSize: "200% 100%",
              animation: "gradient-pan 3s linear infinite",
            }}
          />

          {/* Inner card */}
          <div className="relative bg-[#12121a] px-6 py-4 rounded-[1px]">
            <button
              onClick={() => setShow(false)}
              className="absolute top-2 right-2 p-1 text-white/40 hover:text-white transition-colors rounded-sm"
              aria-label="Dismiss event"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className="size-10 rounded-sm shrink-0 flex items-center justify-center bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.3)] mt-1"
                style={{ color: "#d4a843" }}
              >
                <Sparkles className="size-5" />
              </div>
              <div>
                <div
                  className="text-[9px] font-mono uppercase tracking-[0.3em] mb-1"
                  style={{ color: "#d4a843" }}
                >
                  Market Event
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-white leading-none mb-2">
                  {event.title}
                </h3>
                <p className="text-xs font-mono text-[#9baab8] leading-relaxed">
                  {event.description}
                </p>
                {event.expiresOnTurn != null && (
                  <div className="mt-3 inline-flex items-center text-[9px] font-mono uppercase tracking-widest text-white/50 bg-white/5 px-2 py-1 rounded-sm">
                    Expires Turn {event.expiresOnTurn}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add keyframe to global styles if not present, or inject here:
// @keyframes gradient-pan { 0% { background-position: 100% 0%; } 100% { background-position: -100% 0%; } }
