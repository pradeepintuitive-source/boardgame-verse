import { Client, type IFrame, type StompSubscription } from "@stomp/stompjs";
import { Topics } from "./topics";
import SockJS from "sockjs-client/dist/sockjs";
import { tokenStore } from "../services/api";
import { useWebsocketRequestStore } from "../store/requestStore";

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
    let target = url;
    if (url.startsWith("/")) {
      target = `${window.location.protocol}//${window.location.host}${url}`;
    }
    const isHttp = /^https?:\/\//i.test(target);

    this.client = new Client({
      // Spring Boot /ws SockJS endpoint when http(s); raw ws(s) brokerURL otherwise.
      ...(isHttp
        ? {
            webSocketFactory: () => {
              // Append JWT as a query parameter so the backend handshake interceptor
              // can validate the token during the initial HTTP/SockJS handshake.
              const token = tokenStore.get();
              const targetUrl = token ? `${target}${target.includes("?") ? "&" : "?"}token=${encodeURIComponent(
                token,
              )}` : target;
              return new SockJS(targetUrl, undefined, {
                transports: ["websocket", "xhr-streaming", "xhr-polling"],
              }) as unknown as WebSocket;
            },
          }
        : {}),
      reconnectDelay: 2500,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      debug: () => {},
      beforeConnect: () => {
        const token = tokenStore.get();
        if (!isHttp) {
          const targetUrl = token ? `${target}${target.includes("?") ? "&" : "?"}token=${encodeURIComponent(
            token,
          )}` : target;
          this.client!.brokerURL = targetUrl;
        }
        this.client!.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      onConnect: () => {
        this.emit(true, false);
        const entries = Array.from(this.subs.entries());
        this.subs.clear();
        entries.forEach(([dest, { handler }]) => this.subscribe(dest, handler));
        this.subscribe(Topics.privateAcks, (body) => {
          const ack = body as { requestId?: string; action?: string; success?: boolean; errorCode?: string; message?: string } | null;
          if (!ack?.requestId) return;
          const requests = useWebsocketRequestStore.getState();
          if (ack.success) {
            requests.markAcknowledged(ack.requestId);
          } else {
            requests.failRequest(ack.requestId, ack.errorCode, ack.message ?? "Action rejected by server");
          }
        });
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
    useWebsocketRequestStore.getState().clearAll();
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

  sendMessage(destination: string, body: unknown, requestId?: string) {
    if (this.offline || !this.client?.connected) return false;
    const payload = typeof body === "string" ? body : body;
    const envelope = payload && typeof payload === "object" && "requestId" in payload ? payload : { ...((payload as Record<string, unknown>) ?? {}), requestId };
    console.debug("[stomp] publish", destination, envelope);
    this.client.publish({
      destination,
      body: typeof envelope === "string" ? envelope : JSON.stringify(envelope),
    });
    return true;
  }

  sendTrackedMessage(destination: string, body: unknown, action: string, metadata?: Record<string, unknown>) {
    const existingRequestId =
      typeof body === "object" && body && "requestId" in body && typeof (body as Record<string, unknown>).requestId === "string"
        ? (body as Record<string, unknown>).requestId
        : undefined;
    const requestId = typeof existingRequestId === "string" ? existingRequestId : crypto.randomUUID();
    const requestStore = useWebsocketRequestStore.getState();
    requestStore.createRequest(action, requestId, metadata);
    const sent = this.sendMessage(destination, { ...(body as Record<string, unknown>), requestId }, requestId);
    if (!sent) {
      requestStore.failRequest(requestId, "CONNECTION_ERROR", "Unable to contact server");
    }
    return { sent, requestId };
  }

  get isOffline() {
    return this.offline;
  }
}

const defaultSocketUrl = (() => {
  if (typeof window === "undefined") {
    return null;
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:8080/ws";
  }

  return "wss://api.pradeepkulal.click/ws";
})();

export const stomp = new GameHubStompClient();
stomp.configure(
  typeof window !== "undefined"
    ? ((import.meta.env.NEXT_PUBLIC_WS_URL as string | undefined) ??
       (import.meta.env.VITE_STOMP_URL as string | undefined) ??
       defaultSocketUrl)
    : null,
);
