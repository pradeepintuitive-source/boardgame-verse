import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as stomp, b as useAuthStore, T as Topics, p as pickAvatarColor, c as api } from "./router-CrXfqMs4.mjs";
import { a as Avatar } from "./AppShell-DseihURL.mjs";
import { M as MessageSquare, X, m as Send } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import { c as create } from "../_libs/zustand.mjs";
const chatApi = {
  history: async (roomId) => {
    const { data } = await api.get(`rooms/${roomId}/chat`);
    return data;
  },
  sendMessage: async (roomId, content, targetUserId) => {
    const { data } = await api.post(`rooms/${roomId}/chat`, {
      content,
      targetUserId
    });
    return data;
  }
};
function mapChatResponse(roomId, response) {
  return {
    id: response.id,
    roomId,
    userId: response.senderUserId,
    username: response.senderName,
    avatarColor: pickAvatarColor(response.senderName),
    text: response.content,
    ts: new Date(response.sentAt).getTime(),
    channel: "public"
  };
}
function dedupeMessages(existing, next) {
  if (existing.some((message) => message.id === next.id)) {
    return existing;
  }
  return [...existing, next];
}
const useChatStore = create((set) => ({
  messages: {},
  typing: {},
  drawerOpen: false,
  unread: {},
  send: async (roomId, content) => {
    const response = await chatApi.sendMessage(roomId, content, null);
    const next = mapChatResponse(roomId, response);
    set((s) => ({
      messages: { ...s.messages, [roomId]: dedupeMessages(s.messages[roomId] ?? [], next) }
    }));
  },
  loadHistory: async (roomId) => {
    const history = await chatApi.history(roomId);
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: history.reduce((acc, message) => {
          const next = mapChatResponse(roomId, message);
          return dedupeMessages(acc, next);
        }, s.messages[roomId] ?? [])
      }
    }));
  },
  receiveMessage: (roomId, msg) => set((s) => {
    const next = mapChatResponse(roomId, msg);
    const list = dedupeMessages(s.messages[roomId] ?? [], next);
    const unread = s.drawerOpen ? s.unread : { ...s.unread, [roomId]: (s.unread[roomId] ?? 0) + 1 };
    return { messages: { ...s.messages, [roomId]: list }, unread };
  }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen, unread: !s.drawerOpen ? {} : s.unread })),
  clearUnread: (roomId) => set((s) => ({ unread: { ...s.unread, [roomId]: 0 } })),
  setTyping: (roomId, usernames) => set((s) => ({ typing: { ...s.typing, [roomId]: usernames } }))
}));
function useStompSubscription(destination, handler, enabled = true) {
  reactExports.useEffect(() => {
    if (!destination || !enabled) return;
    const off = stomp.subscribe(destination, (body) => handler(body));
    return off;
  }, [destination, enabled, handler]);
}
function ChatDrawer({ roomId }) {
  const { drawerOpen, toggleDrawer, messages, send, unread, clearUnread, loadHistory, receiveMessage } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = reactExports.useState("");
  const list = messages[roomId] ?? [];
  const unreadCount = unread[roomId] ?? 0;
  reactExports.useEffect(() => {
    if (!roomId) return;
    loadHistory(roomId).catch((error) => console.error("[chat] failed to load history", error));
  }, [roomId, loadHistory]);
  useStompSubscription(
    roomId ? Topics.roomChat(roomId) : null,
    (msg) => {
      if (!msg || msg.type !== "CHAT_MESSAGE") return;
      const payload = msg.payload ?? msg;
      receiveMessage(roomId, payload);
    },
    !!roomId
  );
  reactExports.useEffect(() => {
    if (!drawerOpen || !roomId) return;
    clearUnread(roomId);
  }, [drawerOpen, roomId, clearUnread]);
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    try {
      await send(roomId, text.trim());
    } catch (error) {
      console.error("[chat] failed to send message", error);
    }
    setText("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: toggleDrawer,
        "aria-label": "Toggle chat",
        className: "fixed bottom-20 right-6 z-50 size-14 rounded-full bg-accent-cyan text-black grid place-items-center shadow-[var(--shadow-neon-cyan)] hover:scale-110 transition-transform",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-6" }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-accent-pink text-white text-[10px] font-bold", children: unreadCount })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: drawerOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.aside,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
        className: "fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-card border-l border-white/10 flex flex-col",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan", children: "Live Channel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-2xl italic uppercase", children: "Chat" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: toggleDrawer,
                className: "p-2 hover:text-accent-cyan transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [
            list.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/40 text-sm font-mono", children: "No messages yet. Say something." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: list.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: 16 },
                animate: { opacity: 1, x: 0 },
                className: "flex gap-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name: m.username, color: m.avatarColor, size: 28 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm", style: { color: m.avatarColor }, children: m.username }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono text-white/30 uppercase", children: new Date(m.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/80 break-words", children: m.text })
                  ] })
                ]
              },
              m.id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "p-4 border-t border-white/10 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: text,
                onChange: (e) => setText(e.target.value),
                placeholder: "Type a message...",
                className: "flex-1 bg-background border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-accent-cyan transition-colors"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                className: "size-10 grid place-items-center bg-accent-cyan text-black hover:bg-white transition-colors disabled:opacity-40",
                disabled: !text.trim(),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" })
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
export {
  ChatDrawer as C,
  useStompSubscription as u
};
