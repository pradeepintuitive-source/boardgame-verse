import { Client, type IFrame, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { tokenStore } from "../services/api";

/**
 * GameHub STOMP-over-WebSocket service.
 * Wraps @stomp/stompjs with reconnect, heartbeat and a typed subscription
 * registry. Backend URL is read from VITE_STOMP_URL.
 * Falls back to a no-op offline mode when no URL is configured so the UI
 * keeps working in single-device demos.
 */

type Handler = (body: unknown, frame: IFrame) => void;

class GameHubStompClient {
  private client: Client | null = null;
  private url: string | null = null;
  private subs = new Map<string, { stomp: StompSubscription; handler: Handler }>();
  private listeners = new Set<(connected: boolean, reconnecting: boolean) => void>();
  private offline = true;

  configure(url: string | null) {
    this.url = url;
    this.offline = !url;
  }

  onStatus(cb: (connected: boolean, reconnecting: boolean) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(connected: boolean, reconnecting: boolean) {
    this.listeners.forEach((l) => l(connected, reconnecting));
  }

  connect() {
    if (this.offline || !this.url) {
      this.emit(false, false);
      return;
    }
    if (this.client?.active) return;

    const url = this.url;
    const isHttp = /^https?:\/\//i.test(url);

    this.client = new Client({
      // Spring Boot /ws SockJS endpoint when http(s); raw ws(s) brokerURL otherwise.
      ...(isHttp
        ? {
            webSocketFactory: () =>
              new SockJS(url, undefined, {
                transports: ["websocket", "xhr-streaming", "xhr-polling"],
                transportOptions: {
                  "xhr-streaming": {
                    headers: { "ngrok-skip-browser-warning": "true" },
                  },
                  "xhr-polling": {
                    headers: { "ngrok-skip-browser-warning": "true" },
                  },
                },
              }) as unknown as WebSocket,
          }
        : { brokerURL: url }),
      reconnectDelay: 2500,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      debug: () => {},
      beforeConnect: () => {
        const token = tokenStore.get();
        this.client!.connectHeaders = token
          ? { Authorization: `Bearer ${token}` }
          : {};
      },
      onConnect: () => {
        this.emit(true, false);
        // re-subscribe everything
        const entries = Array.from(this.subs.entries());
        this.subs.clear();
        entries.forEach(([dest, { handler }]) => this.subscribe(dest, handler));
      },
      onWebSocketClose: () => this.emit(false, true),
      onStompError: (frame) => {
        console.error("[stomp] broker error", frame.headers["message"]);
        this.emit(false, true);
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this.subs.clear();
    this.emit(false, false);
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  subscribe(destination: string, handler: Handler) {
    if (!this.client?.connected) {
      // Queue the handler — onConnect will rebind.
      this.subs.set(destination, { stomp: {} as StompSubscription, handler });
      return () => this.unsubscribe(destination);
    }
    const stomp = this.client.subscribe(destination, (msg) => {
      let body: unknown = msg.body;
      try {
        body = JSON.parse(msg.body);
      } catch {
        /* keep as raw */
      }
      handler(body, msg);
    });
    this.subs.set(destination, { stomp, handler });
    return () => this.unsubscribe(destination);
  }

  unsubscribe(destination: string) {
    const sub = this.subs.get(destination);
    if (sub?.stomp.unsubscribe) sub.stomp.unsubscribe();
    this.subs.delete(destination);
  }

  sendMessage(destination: string, body: unknown) {
    if (this.offline || !this.client?.connected) return false;
    this.client.publish({
      destination,
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    return true;
  }

  get isOffline() {
    return this.offline;
  }
}

export const stomp = new GameHubStompClient();
stomp.configure(
  typeof window !== "undefined"
    ? (import.meta.env.VITE_STOMP_URL as string | undefined) ?? null
    : null,
);