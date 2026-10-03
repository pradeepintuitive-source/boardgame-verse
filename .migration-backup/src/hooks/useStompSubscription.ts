import { useEffect } from "react";
import { stomp } from "../websocket/stompClient";

export function useStompSubscription<T = unknown>(
  destination: string | null,
  handler: (body: T) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!destination || !enabled) return;
    const off = stomp.subscribe(destination, (body) => handler(body as T));
    return off;
  }, [destination, enabled, handler]);
}
