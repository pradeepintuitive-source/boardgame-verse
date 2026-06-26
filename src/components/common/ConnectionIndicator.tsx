import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useConnectionStore } from "../../store/connectionStore";
import { stomp } from "../../websocket/stompClient";

/**
 * Compact STOMP/WebSocket connection status indicator.
 * Shows live state (online / reconnecting / offline) with a manual retry
 * affordance when disconnected. Suitable for lobby headers and chat panels.
 */
export function ConnectionIndicator({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const connected = useConnectionStore((s) => s.connected);
  const reconnecting = useConnectionStore((s) => s.reconnecting);

  const status: "online" | "reconnecting" | "offline" = reconnecting
    ? "reconnecting"
    : connected
      ? "online"
      : "offline";

  const config = {
    online: {
      label: "LIVE",
      detail: "Realtime channel connected",
      icon: Wifi,
      dot: "bg-accent-cyan",
      ring: "border-accent-cyan/40",
      text: "text-accent-cyan",
      pulse: true,
    },
    reconnecting: {
      label: "RECONNECTING",
      detail: "Restoring realtime channel…",
      icon: Loader2,
      dot: "bg-accent-amber",
      ring: "border-accent-amber/40",
      text: "text-accent-amber",
      pulse: true,
    },
    offline: {
      label: stomp.isOffline ? "LOCAL" : "OFFLINE",
      detail: stomp.isOffline
        ? "No realtime backend configured"
        : "Disconnected from server",
      icon: WifiOff,
      dot: "bg-destructive",
      ring: "border-destructive/40",
      text: "text-destructive",
      pulse: false,
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/40 backdrop-blur ${config.ring} ${className}`}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={`size-1.5 rounded-full ${config.dot} ${config.pulse ? "animate-pulse" : ""}`}
        />
        {status === "reconnecting" && (
          <span className="absolute inset-0 -m-1 rounded-full border border-accent-amber/40 animate-ping" />
        )}
      </span>
      <Icon
        className={`size-3 ${config.text} ${status === "reconnecting" ? "animate-spin" : ""}`}
      />
      <span
        className={`text-[10px] font-mono uppercase tracking-[0.25em] ${config.text}`}
      >
        {config.label}
      </span>
      {!compact && (
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.2 }}
            className="hidden md:inline text-[10px] font-mono text-white/40 tracking-wider"
          >
            · {config.detail}
          </motion.span>
        </AnimatePresence>
      )}
      {status === "offline" && !stomp.isOffline && (
        <button
          onClick={() => stomp.reconnect()}
          className="ml-1 text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-accent-cyan border border-white/15 hover:border-accent-cyan px-2 py-0.5 rounded-sm transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}