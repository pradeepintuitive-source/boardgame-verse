import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useConnectionStore } from "../store/connectionStore";
import { useAuthStore } from "../store/authStore";
import { stomp } from "../websocket/stompClient";

/**
 * Surfaces STOMP/WebSocket state transitions as toasts with a retry action.
 * Silent for the initial mount and for guests on unauthenticated screens.
 */
export function useStompStatusToasts() {
  const user = useAuthStore((s) => s.user);
  const connected = useConnectionStore((s) => s.connected);
  const reconnecting = useConnectionStore((s) => s.reconnecting);
  const prev = useRef<{ connected: boolean; reconnecting: boolean } | null>(null);

  useEffect(() => {
    if (!user || stomp.isOffline) {
      prev.current = { connected, reconnecting };
      return;
    }
    const last = prev.current;
    prev.current = { connected, reconnecting };
    if (!last) return; // skip first paint

    const wasOnline = last.connected && !last.reconnecting;
    const isOnline = connected && !reconnecting;
    const isDown = !connected && !reconnecting;

    if (wasOnline && !isOnline && !isDown) {
      toast.warning("Realtime channel dropped", {
        description: "Reconnecting to the server…",
      });
    } else if (!last.connected && isOnline) {
      toast.success("Realtime channel restored");
    } else if (isDown && (last.connected || last.reconnecting)) {
      toast.error("Disconnected from server", {
        description: "Live updates paused. Retry to reconnect.",
        action: {
          label: "Retry",
          onClick: () => stomp.reconnect(),
        },
        duration: 10_000,
      });
    }
  }, [connected, reconnecting, user]);
}