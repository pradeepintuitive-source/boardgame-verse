import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "../common/Avatar";
import { useStompSubscription } from "../../hooks/useStompSubscription";
import { Topics } from "../../websocket/topics";

export function ChatDrawer({ roomId }: { roomId: string }) {
  const { drawerOpen, toggleDrawer, messages, send, unread, clearUnread, loadHistory, receiveMessage } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const list = messages[roomId] ?? [];
  const unreadCount = unread[roomId] ?? 0;

  useEffect(() => {
    if (!roomId) return;
    loadHistory(roomId).catch((error) => console.error("[chat] failed to load history", error));
  }, [roomId, loadHistory]);

  useStompSubscription<any>(
    roomId ? Topics.roomChat(roomId) : null,
    (msg) => {
      if (!msg || msg.type !== "CHAT_MESSAGE") return;
      const payload = msg.payload ?? msg;
      receiveMessage(roomId, payload);
    },
    !!roomId,
  );

  useEffect(() => {
    if (!drawerOpen || !roomId) return;
    clearUnread(roomId);
  }, [drawerOpen, roomId, clearUnread]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    try {
      await send(roomId, text.trim());
    } catch (error) {
      console.error("[chat] failed to send message", error);
    }
    setText("");
  };

  return (
    <>
      <button
        onClick={toggleDrawer}
        aria-label="Toggle chat"
        className="fixed bottom-20 right-6 z-50 size-14 rounded-full bg-accent-cyan text-black grid place-items-center shadow-[var(--shadow-neon-cyan)] hover:scale-110 transition-transform"
      >
        <MessageSquare className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-accent-pink text-white text-[10px] font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-card border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan">
                  Live Channel
                </div>
                <div className="font-display text-2xl italic uppercase">Chat</div>
              </div>
              <button
                onClick={toggleDrawer}
                className="p-2 hover:text-accent-cyan transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {list.length === 0 && (
                <p className="text-white/40 text-sm font-mono">No messages yet. Say something.</p>
              )}
              <AnimatePresence initial={false}>
                {list.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar name={m.username} color={m.avatarColor} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm" style={{ color: m.avatarColor }}>
                          {m.username}
                        </span>
                        <span className="text-[9px] font-mono text-white/30 uppercase">
                          {new Date(m.ts).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 break-words">{m.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form onSubmit={submit} className="p-4 border-t border-white/10 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-background border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-accent-cyan transition-colors"
              />
              <button
                type="submit"
                className="size-10 grid place-items-center bg-accent-cyan text-black hover:bg-white transition-colors disabled:opacity-40"
                disabled={!text.trim()}
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
