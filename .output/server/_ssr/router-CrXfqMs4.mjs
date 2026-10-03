import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as axios } from "../_libs/axios.mjs";
import { t as toast, T as Toaster$1 } from "../_libs/sonner.mjs";
import { c as create, p as persist$1 } from "../_libs/zustand.mjs";
import { S as SockJS } from "../_libs/sockjs-client.mjs";
import { C as Client } from "../_libs/stomp__stompjs.mjs";
import { T as TriangleAlert, R as RefreshCcw, H as House } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/form-data.mjs";





import "../_libs/combined-stream.mjs";

import "../_libs/delayed-stream.mjs";

import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";



import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "../_libs/supports-color.mjs";

import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";


import "../_libs/follow-redirects.mjs";

const appCss = "/assets/styles-DipbZta0.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const configuredApiUrl = "/api";
const API_BASE_URL = configuredApiUrl;
const TOKEN_STORAGE_KEY = "gh.jwt";
const REFRESH_STORAGE_KEY = "gh.jwt.refresh";
const tokenStore = {
  get: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set: (token) => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
  getRefresh: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  },
  setRefresh: (token) => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(REFRESH_STORAGE_KEY, token);
    else localStorage.removeItem(REFRESH_STORAGE_KEY);
  },
  clear: () => {
    tokenStore.set(null);
    tokenStore.setRefresh(null);
  }
};
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15e3,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    // ngrok free tier interstitial bypass — harmless against any other host
    "ngrok-skip-browser-warning": "true"
  }
});
class ApiError extends Error {
  status;
  error;
  details;
  path;
  constructor(init) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.error = init.error ?? "Error";
    this.details = init.details ?? [];
    this.path = init.path;
  }
}
function isApiResponse(body) {
  return !!body && typeof body === "object" && "status" in body && "data" in body && "path" in body;
}
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
let onUnauthorized = null;
function setUnauthorizedHandler(cb) {
  onUnauthorized = cb;
}
api.interceptors.response.use(
  (r) => {
    if (isApiResponse(r.data)) {
      const wrapped = r.data;
      if (wrapped.details && wrapped.details.length > 0) {
        console.info("[api]", r.config.url, wrapped.message, wrapped.details);
      }
      const method = (r.config.method ?? "get").toLowerCase();
      const silent = r.config.headers?.["X-Silent-Toast"] === "true";
      if (!silent && method !== "get" && wrapped.message && wrapped.message.toLowerCase() !== "ok") {
        toast.success(wrapped.message);
      }
      r.data = wrapped.data;
    }
    return r;
  },
  (err) => {
    const status = err.response?.status;
    const body = err.response?.data;
    const message = body?.message ?? body?.error ?? err.message ?? "Request failed";
    const details = body?.details ?? [];
    if (status === 401) {
      const url = String(err.config?.url ?? body?.path ?? "");
      const isCredentialAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/guest");
      const isSessionExpiry = url.includes("/auth/refresh") || message.toLowerCase().includes("session expired") || message.toLowerCase().includes("invalid session");
      if (!isCredentialAuthAttempt) {
        toast.error(message || "Authentication failed", {
          description: details.length > 0 ? details.join("\n") : isSessionExpiry ? "Please sign in again to continue." : void 0
        });
      }
      if (!isCredentialAuthAttempt || isSessionExpiry) {
        tokenStore.clear();
        onUnauthorized?.();
      }
    }
    console.warn("[api]", status, message, details);
    const apiError = new ApiError({
      message,
      status: status ?? 0,
      error: body?.error,
      details,
      path: body?.path
    });
    if (status && status !== 401) {
      toast.error(body?.error ?? "Request failed", {
        description: details.length > 0 ? details.join("\n") : message
      });
    } else if (!err.response) {
      toast.error("Network error", { description: err.message });
    }
    return Promise.reject(apiError);
  }
);
function apiErrorMessage(err) {
  if (err instanceof ApiError) {
    return err.details.length > 0 ? `${err.message}: ${err.details.join(", ")}` : err.message;
  }
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    return data?.message ?? data?.error ?? err.message;
  }
  return err instanceof Error ? err.message : "Unknown error";
}
function normalize(raw) {
  const accessToken = raw.accessToken ?? raw.token ?? raw.jwt ?? raw.access_token ?? "";
  const refreshToken = raw.refreshToken ?? raw.refresh_token;
  const user = raw.user ?? {
    id: raw.id ?? "",
    username: raw.username ?? "",
    email: raw.email,
    avatarColor: raw.avatarColor ?? "#7c3aed",
    isGuest: raw.isGuest ?? raw.guest ?? false
  };
  return { accessToken, refreshToken, user };
}
function normalizeMe(raw) {
  return {
    id: raw.id ?? raw.userId ?? "",
    username: raw.username ?? "",
    email: raw.email,
    avatarColor: raw.avatarColor ?? "#7c3aed",
    isGuest: raw.isGuest ?? raw.guest ?? false
  };
}
function persist(res) {
  if (res.accessToken) tokenStore.set(res.accessToken);
  if (res.refreshToken) tokenStore.setRefresh(res.refreshToken);
}
const authApi = {
  async login(username, password) {
    const { data } = await api.post("auth/login", {
      username,
      password
    });
    const res = normalize(data);
    persist(res);
    return res;
  },
  async register(username, email, password) {
    const { data } = await api.post("auth/register", {
      username,
      email,
      password
    });
    const res = normalize(data);
    persist(res);
    return res;
  },
  async guest(username) {
    const { data } = await api.post("auth/guest", {
      username
    });
    const res = normalize(data);
    persist(res);
    return res;
  },
  async me() {
    const { data } = await api.get("auth/me");
    return normalizeMe(data);
  },
  async refresh() {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) return null;
    const { data } = await api.post("auth/refresh", {
      refreshToken
    });
    const res = normalize(data);
    persist(res);
    return res;
  },
  async logout() {
    try {
      await api.post("auth/logout");
    } catch {
    }
    tokenStore.clear();
  }
};
const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
const palette = [
  "#00f2ff",
  "#ff00e5",
  "#facc15",
  "#4ade80",
  "#a78bfa",
  "#fb7185",
  "#38bdf8",
  "#fb923c",
  "#34d399",
  "#f472b6"
];
const pickAvatarColor = (seed) => {
  if (!seed) return palette[Math.floor(Math.random() * palette.length)];
  let h = 0;
  for (const c of seed) h = h * 31 + c.charCodeAt(0) >>> 0;
  return palette[h % palette.length];
};
const initials = (name) => name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const useAuthStore = create()(
  persist$1(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      loginGuest: (username) => set({
        user: {
          id: uid("usr"),
          username,
          avatarColor: pickAvatarColor(username),
          isGuest: true
        }
      }),
      login: async (username, _password) => {
        await new Promise((r) => setTimeout(r, 300));
        set({
          user: {
            id: uid("usr"),
            username,
            avatarColor: pickAvatarColor(username),
            isGuest: false
          }
        });
      },
      register: async (username, email, _password) => {
        await new Promise((r) => setTimeout(r, 300));
        set({
          user: {
            id: uid("usr"),
            username,
            email,
            avatarColor: pickAvatarColor(username),
            isGuest: false
          }
        });
      },
      logout: () => set({ user: null }),
      updateProfile: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : null }))
    }),
    { name: "gamehub.auth" }
  )
);
const Topics = {
  // Broadcast
  room: (roomId) => `/topic/rooms/${roomId}`,
  roomChat: (roomId) => `/topic/rooms/${roomId}/chat`,
  // Server broadcasts game lifecycle and updates using roomId as key
  gameRoom: (roomId) => `/topic/game/${roomId}`,
  game: (gameId) => `/topic/games/${gameId}`,
  gameEvents: (gameId) => `/topic/games/${gameId}/events`,
  presence: (roomId) => `/topic/rooms/${roomId}/presence`,
  // Private (per-user)
  privateRole: "/user/queue/role",
  privateError: "/user/queue/errors",
  privateAcks: "/user/queue/acks",
  // Send (client → server)
  send: {
    roomReady: (roomId) => `/app/rooms/${roomId}/ready`,
    roomChat: (roomId) => `/app/rooms/${roomId}/chat`,
    gameAction: (sessionId) => `/app/games/${sessionId}/action`,
    auction: (sessionId) => `/app/games/${sessionId}/auction`,
    pause: (gameId) => `/app/games/${gameId}/pause`,
    resume: (gameId) => `/app/games/${gameId}/resume`
  }
};
const DEFAULT_TIMEOUT_MS = 15e3;
const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
const useWebsocketRequestStore = create((set, get) => ({
  pendingRequests: [],
  createRequest: (action, requestId = makeId(), metadata, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    console.log("CREATE REQUEST", { action, requestId });
    if (!action) return null;
    const existing = get().pendingRequests.find((req) => req.requestId === requestId);
    if (existing) return existing;
    const entry = {
      requestId,
      action,
      status: "pending",
      createdAt: Date.now(),
      metadata: metadata ?? {}
    };
    const timeoutHandle = setTimeout(() => {
      get().failRequest(requestId, "TIMEOUT", "Unable to contact server");
    }, timeoutMs);
    entry.timeoutId = timeoutHandle;
    set((state) => ({ pendingRequests: [...state.pendingRequests, entry] }));
    return entry;
  },
  markAcknowledged: (requestId) => {
    console.log("ACK MARKED", requestId);
    set((state) => ({
      pendingRequests: state.pendingRequests.map(
        (req) => req.requestId === requestId ? { ...req, status: "acknowledged" } : req
      )
    }));
  },
  completeRequest: (requestId) => {
    console.log("COMPLETE REQUEST", requestId);
    const request = get().pendingRequests.find((req) => req.requestId === requestId);
    if (request?.timeoutId) {
      clearTimeout(request.timeoutId);
    }
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req.requestId !== requestId)
    }));
  },
  completeAllRequests: () => {
    get().pendingRequests.forEach((req) => {
      if (req.timeoutId) clearTimeout(req.timeoutId);
    });
    set({ pendingRequests: [] });
  },
  failRequest: (requestId, errorCode, message) => {
    console.log("FAIL REQUEST", { requestId, errorCode, message });
    const request = get().pendingRequests.find((req) => req.requestId === requestId);
    if (request?.timeoutId) {
      clearTimeout(request.timeoutId);
    }
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((req) => req.requestId !== requestId)
    }));
    toast.error(message ?? "Request failed", {
      description: errorCode ? `${errorCode}` : void 0
    });
  },
  clearAll: () => {
    get().pendingRequests.forEach((req) => {
      if (req.timeoutId) clearTimeout(req.timeoutId);
    });
    set({ pendingRequests: [] });
  }
}));
class GameHubStompClient {
  client = null;
  url = null;
  subs = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  offline = true;
  configure(url) {
    this.url = url;
    this.offline = !url;
  }
  onStatus(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  emit(connected, reconnecting) {
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
      ...isHttp ? {
        webSocketFactory: () => {
          const token = tokenStore.get();
          const targetUrl = token ? `${target}${target.includes("?") ? "&" : "?"}token=${encodeURIComponent(
            token
          )}` : target;
          return new SockJS(targetUrl, void 0, {
            transports: ["websocket", "xhr-streaming", "xhr-polling"]
          });
        }
      } : {},
      reconnectDelay: 2500,
      heartbeatIncoming: 1e4,
      heartbeatOutgoing: 1e4,
      debug: () => {
      },
      beforeConnect: () => {
        const token = tokenStore.get();
        if (!isHttp) {
          const targetUrl = token ? `${target}${target.includes("?") ? "&" : "?"}token=${encodeURIComponent(
            token
          )}` : target;
          this.client.brokerURL = targetUrl;
        }
        this.client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      onConnect: () => {
        console.log("ON CONNECT START");
        console.log("STOMP CONNECTED");
        this.emit(true, false);
        const entries = Array.from(this.subs.entries());
        this.subs.clear();
        entries.forEach(([dest, { handler }]) => this.subscribe(dest, handler));
        console.log("About to subscribe ACK");
        console.log(Topics.privateAcks);
        this.subscribe(Topics.privateAcks, (body) => {
          console.log("ACK subscribed");
          console.log("******** ACK RECEIVED ********");
          console.log(body);
          const ack = body;
          console.log("ACK requestId", ack?.requestId);
          console.log("ACK success", ack?.success);
          if (!ack?.requestId) return;
          const requests = useWebsocketRequestStore.getState();
          if (ack.success) {
            requests.markAcknowledged(ack.requestId);
            requests.completeRequest(ack.requestId);
          } else {
            requests.failRequest(ack.requestId, ack.errorCode, ack.message ?? "Action rejected by server");
          }
        });
      },
      onWebSocketClose: () => this.emit(false, true),
      onStompError: (frame) => {
        console.error("[stomp] broker error", frame.headers["message"]);
        this.emit(false, true);
      }
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
  subscribe(destination, handler) {
    console.log("subscribe() called:", destination);
    if (!this.client?.connected) {
      this.subs.set(destination, { stomp: {}, handler });
      return () => this.unsubscribe(destination);
    }
    console.log("[SUBSCRIBE]", destination);
    console.debug("[stomp] subscribing to", destination);
    const stomp2 = this.client.subscribe(destination, (msg) => {
      let body = msg.body;
      try {
        body = JSON.parse(msg.body);
      } catch {
      }
      console.log("[STOMP INCOMING]", { destination, headers: msg.headers, body });
      handler(body, msg);
    });
    this.subs.set(destination, { stomp: stomp2, handler });
    return () => this.unsubscribe(destination);
  }
  unsubscribe(destination) {
    const sub = this.subs.get(destination);
    if (sub?.stomp.unsubscribe) sub.stomp.unsubscribe();
    this.subs.delete(destination);
  }
  sendMessage(destination, body, requestId) {
    if (this.offline || !this.client?.connected) return false;
    const payload = typeof body === "string" ? body : body;
    const envelope = payload && typeof payload === "object" && "requestId" in payload ? payload : { ...payload ?? {}, requestId };
    console.log("[STOMP PUBLISH]", { destination, requestId, payload: envelope });
    console.debug("[stomp] publish", destination, envelope);
    this.client.publish({
      destination,
      body: typeof envelope === "string" ? envelope : JSON.stringify(envelope)
    });
    return true;
  }
  sendTrackedMessage(destination, body, action, metadata) {
    const existingRequestId = typeof body === "object" && body && "requestId" in body && typeof body.requestId === "string" ? body.requestId : void 0;
    const requestId = typeof existingRequestId === "string" ? existingRequestId : crypto.randomUUID();
    const requestStore = useWebsocketRequestStore.getState();
    console.log("CREATE REQUEST", { action, requestId });
    requestStore.createRequest(action, requestId, metadata);
    const sent = this.sendMessage(destination, { ...body, requestId }, requestId);
    if (!sent) {
      requestStore.failRequest(requestId, "CONNECTION_ERROR", "Unable to contact server");
    }
    return { sent, requestId };
  }
  get isOffline() {
    return this.offline;
  }
}
function toSockJsUrl(url) {
  if (url.startsWith("wss://")) return `https://${url.slice("wss://".length)}`;
  if (url.startsWith("ws://")) return `http://${url.slice("ws://".length)}`;
  return url;
}
const stomp = new GameHubStompClient();
stomp.configure(
  typeof window !== "undefined" ? toSockJsUrl(
    "/ws"
  ) : null
);
const AuthContext = reactExports.createContext(null);
function AuthProvider({ children }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.logout);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = tokenStore.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        tokenStore.clear();
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, clear]);
  const prevUserRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;
    if (user && !prev) {
      stomp.connect();
    } else if (user && prev && prev.id !== user.id) {
      stomp.reconnect();
    } else if (!user && prev) {
      stomp.disconnect();
    }
  }, [user]);
  reactExports.useEffect(() => {
    setUnauthorizedHandler(() => clear());
  }, [clear]);
  const login = reactExports.useCallback(
    async (username, password) => {
      const { user: user2 } = await authApi.login(username, password);
      setUser(user2);
    },
    [setUser]
  );
  const register = reactExports.useCallback(
    async (username, email, password) => {
      const { user: user2 } = await authApi.register(username, email, password);
      setUser(user2);
    },
    [setUser]
  );
  const loginGuest = reactExports.useCallback(
    async (username) => {
      const { user: user2 } = await authApi.guest(username);
      setUser({ ...user2, isGuest: true });
    },
    [setUser]
  );
  const logout = reactExports.useCallback(async () => {
    await authApi.logout();
    clear();
  }, [clear]);
  const value = reactExports.useMemo(
    () => ({ user, loading, login, register, loginGuest, logout }),
    [user, loading, login, register, loginGuest, logout]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
class ErrorBoundary extends reactExports.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
    reportLovableError(error, {
      boundary: "global_error_boundary",
      componentStack: info.componentStack ?? void 0
    });
  }
  reset = () => this.setState({ error: null });
  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback)
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-background px-6 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg w-full glass-panel border border-destructive/40 p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-5 size-14 grid place-items-center rounded-full bg-destructive/10 border border-destructive/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-7 text-destructive" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-destructive mb-2", children: "Unexpected Error" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl md:text-4xl italic uppercase mb-3", children: "Something broke" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60 font-mono mb-6 leading-relaxed", children: "The app hit an unexpected error. It has been logged for review. You can retry the current view or head back to the lobby." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-left text-[11px] font-mono text-white/50 bg-black/40 border border-white/10 rounded p-3 mb-6 max-h-40 overflow-auto", children: this.state.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: this.reset,
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-accent-cyan text-black text-xs font-mono uppercase tracking-widest hover:bg-accent-cyan/80 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "size-3.5" }),
              " Retry"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: "/",
            className: "inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-white/20 text-xs font-mono uppercase tracking-widest text-white/80 hover:border-accent-cyan hover:text-accent-cyan transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "size-3.5" }),
              " Go Home"
            ]
          }
        )
      ] })
    ] }) });
  }
}
const useConnectionStore = create((set) => {
  let initialised = false;
  return {
    connected: false,
    reconnecting: false,
    lastError: null,
    latencyMs: 24,
    roomId: null,
    setRoom: (id) => set({ roomId: id }),
    init: () => {
      if (initialised) return;
      initialised = true;
      stomp.onStatus((connected, reconnecting) => set({ connected, reconnecting }));
    }
  };
});
function useStompStatusToasts() {
  const user = useAuthStore((s) => s.user);
  const connected = useConnectionStore((s) => s.connected);
  const reconnecting = useConnectionStore((s) => s.reconnecting);
  const prev = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!user || stomp.isOffline) {
      prev.current = { connected, reconnecting };
      return;
    }
    const last = prev.current;
    prev.current = { connected, reconnecting };
    if (!last) return;
    const wasOnline = last.connected && !last.reconnecting;
    const isOnline = connected && !reconnecting;
    const isDown = !connected && !reconnecting;
    if (wasOnline && !isOnline && !isDown) {
      toast.warning("Realtime channel dropped", {
        description: "Reconnecting to the server…"
      });
    } else if (!last.connected && isOnline) {
      toast.success("Realtime channel restored");
    } else if (isDown && (last.connected || last.reconnecting)) {
      toast.error("Disconnected from server", {
        description: "Live updates paused. Retry to reconnect.",
        action: {
          label: "Retry",
          onClick: () => stomp.reconnect()
        },
        duration: 1e4
      });
    }
  }, [connected, reconnecting, user]);
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$a = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$a.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RootInner, {}) }) });
}
function RootInner() {
  reactExports.useEffect(() => {
    useConnectionStore.getState().init();
  }, []);
  useStompStatusToasts();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ErrorBoundary, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right", richColors: true, closeButton: true })
  ] });
}
const $$splitComponentImporter$9 = () => import("./settings-D-U-T1Zf.mjs");
const Route$9 = createFileRoute("/settings")({
  head: () => ({
    meta: [{
      title: "Settings — GameHub"
    }, {
      name: "description",
      content: "Configure GameHub preferences."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./register-Bav918gC.mjs");
const Route$8 = createFileRoute("/register")({
  head: () => ({
    meta: [{
      title: "Register — GameHub"
    }, {
      name: "description",
      content: "Create a GameHub account."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./profile-CduAft8i.mjs");
const Route$7 = createFileRoute("/profile")({
  head: () => ({
    meta: [{
      title: "Profile — GameHub"
    }, {
      name: "description",
      content: "Manage your GameHub profile."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./login-DuNfK1Yn.mjs");
const Route$6 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign In — GameHub"
    }, {
      name: "description",
      content: "Sign in to GameHub or play as a guest."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./join-room-BksTdSaC.mjs");
const Route$5 = createFileRoute("/join-room")({
  head: () => ({
    meta: [{
      title: "Join Room — GameHub"
    }, {
      name: "description",
      content: "Join a GameHub room with a code."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./create-room-BJbQhLZw.mjs");
const Route$4 = createFileRoute("/create-room")({
  head: () => ({
    meta: [{
      title: "Create Room — GameHub"
    }, {
      name: "description",
      content: "Spin up a new GameHub room."
    }]
  }),
  validateSearch: (s) => ({
    game: s.game ?? "mafia"
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index-RyVD1jO1.mjs");
const Route$3 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "GameHub — Premium Multiplayer Board Gaming"
    }, {
      name: "description",
      content: "Play Mafia and Monopoly with friends or AI. Single-device, LAN, or online — premium board gaming for the modern arcade."
    }, {
      property: "og:title",
      content: "GameHub — Premium Multiplayer Board Gaming"
    }, {
      property: "og:description",
      content: "Mafia & Monopoly. Single-device, LAN, online. Premium board gaming reborn."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./monopoly._gameId-Bx3mS-Ok.mjs");
const Route$2 = createFileRoute("/monopoly/$gameId")({
  head: () => ({
    meta: [{
      title: "Monopoly: India Edition — GameHub"
    }, {
      name: "description",
      content: "Play Monopoly: India Edition with friends and AI. Indian cities, ₹ currency, offline-ready."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./mafia._gameId-CPwK4YQm.mjs");
const Route$1 = createFileRoute("/mafia/$gameId")({
  head: () => ({
    meta: [{
      title: "Mafia — GameHub"
    }, {
      name: "description",
      content: "Play Mafia with friends and AI."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./lobby._roomId-CG1kc02M.mjs");
const Route = createFileRoute("/lobby/$roomId")({
  head: () => ({
    meta: [{
      title: "Lobby — GameHub"
    }, {
      name: "description",
      content: "Waiting room before the match starts."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SettingsRoute = Route$9.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$a
});
const RegisterRoute = Route$8.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$a
});
const ProfileRoute = Route$7.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$a
});
const LoginRoute = Route$6.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$a
});
const JoinRoomRoute = Route$5.update({
  id: "/join-room",
  path: "/join-room",
  getParentRoute: () => Route$a
});
const CreateRoomRoute = Route$4.update({
  id: "/create-room",
  path: "/create-room",
  getParentRoute: () => Route$a
});
const IndexRoute = Route$3.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const MonopolyGameIdRoute = Route$2.update({
  id: "/monopoly/$gameId",
  path: "/monopoly/$gameId",
  getParentRoute: () => Route$a
});
const MafiaGameIdRoute = Route$1.update({
  id: "/mafia/$gameId",
  path: "/mafia/$gameId",
  getParentRoute: () => Route$a
});
const LobbyRoomIdRoute = Route.update({
  id: "/lobby/$roomId",
  path: "/lobby/$roomId",
  getParentRoute: () => Route$a
});
const rootRouteChildren = {
  IndexRoute,
  CreateRoomRoute,
  JoinRoomRoute,
  LoginRoute,
  ProfileRoute,
  RegisterRoute,
  SettingsRoute,
  LobbyRoomIdRoute,
  MafiaGameIdRoute,
  MonopolyGameIdRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  API_BASE_URL as A,
  Route$4 as R,
  Topics as T,
  apiErrorMessage as a,
  useAuthStore as b,
  api as c,
  Route$2 as d,
  useConnectionStore as e,
  useWebsocketRequestStore as f,
  Route$1 as g,
  Route as h,
  uid as i,
  initials as j,
  pickAvatarColor as p,
  router as r,
  stomp as s,
  useAuth as u
};
