import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Send, Mic, MicOff, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "../common/Avatar";
import { useStompSubscription } from "../../hooks/useStompSubscription";
import { Topics } from "../../websocket/topics";

export function ChatDrawer({ roomId }: { roomId: string }) {
  // Chat state
  const {
    drawerOpen,
    toggleDrawer,
    messages,
    send,
    unread,
    clearUnread,
    loadHistory,
    receiveMessage,
  } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const list = messages[roomId] ?? [];
  const unreadCount = unread[roomId] ?? 0;

  // Voice state
  // Voice state is disabled in this build
  const joined = false;
  const speaking = false;
  const activeSpeakers = new Set<string>();
  const localMuted = false;
  const joinVoice = (r: string) => alert("Voice not implemented in this tier");
  const leaveVoice = () => {};
  const toggleMute = () => {};
  const remoteStreams = new Map<string, any>();

  useEffect(() => {
    if (!roomId) return;
    loadHistory(roomId).catch((error) => console.error("[chat] failed to load history", error));
  }, [roomId, loadHistory]);

  useStompSubscription(
    roomId ? Topics.roomChat(roomId) : null,
    (msg: Record<string, unknown>) => {
      if (!msg || msg["type"] !== "CHAT_MESSAGE") return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = (msg["payload"] ?? msg) as any;
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
      {/* Floating Toggle Button */}
      <button
        onClick={toggleDrawer}
        aria-label="Toggle chat"
        className={[
          "fixed bottom-20 right-6 z-50 size-14 rounded-full grid place-items-center transition-transform hover:scale-110",
          joined && speaking
            ? "bg-[#2a5f3f] text-white shadow-[0_0_30px_rgba(42,95,63,0.6)]" // Speaking: Emerald glow
            : "bg-[#d4a843] text-black shadow-[0_0_20px_rgba(212,168,67,0.4)]",
        ].join(" ")}
      >
        {/* If joined to voice, we might want to pulse the button when others speak */}
        {joined && activeSpeakers.size > 0 && !speaking && (
          <div className="absolute inset-0 rounded-full border-2 border-[#2a5f3f] voice-ring" />
        )}

        {joined ? <Volume2 className="size-6" /> : <MessageSquare className="size-6" />}

        {unreadCount > 0 && !drawerOpen && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-[#8b2335] text-white text-[10px] font-bold shadow-md">
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[340px] flex flex-col"
            style={{
              background: "#12121a",
              borderLeft: "1px solid rgba(212,168,67,0.2)",
              boxShadow: "-8px 0 48px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(212,168,67,0.12)" }}
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4a843]">
                  Comms Channel
                </div>
                <div className="font-display text-2xl font-bold uppercase text-white tracking-tight">
                  Lobby Chat
                </div>
              </div>
              <button
                onClick={toggleDrawer}
                className="size-8 grid place-items-center hover:bg-[rgba(212,168,67,0.1)] hover:text-[#d4a843] rounded-sm transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Voice Control Panel */}
            <div
              className="p-4 shrink-0 bg-[#0d0d12]"
              style={{ borderBottom: "1px solid rgba(212,168,67,0.12)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
                  Voice Comms
                </div>
                {joined && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#2a5f3f]">
                    <span className="relative flex size-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2a5f3f] opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-[#2a5f3f]"></span>
                    </span>
                    Connected
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!joined ? (
                  <button
                    onClick={() => joinVoice(roomId)}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-[#d4a843]/15 border border-[#d4a843]/40 text-[#d4a843] hover:bg-[#d4a843] hover:text-[#0d0d12] rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors"
                  >
                    <Volume2 className="size-4" /> Join Voice
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={[
                        "flex-1 flex items-center justify-center gap-2 min-h-[44px] rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors border",
                        localMuted
                          ? "bg-[#8b2335]/15 border-[#8b2335]/40 text-[#e05060] hover:bg-[#8b2335] hover:text-white"
                          : speaking
                            ? "bg-[#2a5f3f] border-[#2a5f3f] text-white shadow-[0_0_15px_rgba(42,95,63,0.4)]"
                            : "bg-[#1e1e2e] border-white/10 text-white hover:border-[#d4a843]/40 hover:text-[#d4a843]",
                      ].join(" ")}
                    >
                      {localMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                      {localMuted ? "Muted" : speaking ? "Speaking" : "Mic On"}
                    </button>
                    <button
                      onClick={leaveVoice}
                      className="min-h-[44px] px-4 flex items-center justify-center bg-transparent border border-[#8b2335]/40 text-[#e05060] hover:bg-[#8b2335] hover:text-white rounded-sm transition-colors text-[10px] font-bold uppercase tracking-widest"
                      title="Disconnect from voice"
                    >
                      Leave
                    </button>
                  </>
                )}
              </div>

              {/* Active speakers indicator */}
              {joined && (
                <div className="mt-3 min-h-[28px] flex flex-wrap gap-2">
                  {Array.from(remoteStreams.entries()).map(([peerId]) => {
                    const isPeerSpeaking = activeSpeakers.has(peerId);
                    return (
                      <div
                        key={peerId}
                        className={[
                          "px-2 py-1 rounded-sm text-[9px] font-mono border transition-colors",
                          isPeerSpeaking
                            ? "bg-[#2a5f3f]/20 border-[#2a5f3f] text-[#4cd183]"
                            : "bg-[#1e1e2e] border-transparent text-[#9baab8]",
                        ].join(" ")}
                      >
                        {isPeerSpeaking ? "🗣️ " : ""}
                        User {peerId.slice(0, 4)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {list.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <MessageSquare className="size-8 mb-2" />
                  <p className="text-xs font-mono uppercase tracking-widest">No messages yet</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {list.map((m) => {
                  const isMe = m.username === user?.username;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: isMe ? 16 : -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar name={m.username} color={m.avatarColor} size={28} />
                      <div
                        className={`flex-1 min-w-0 flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-[11px]" style={{ color: m.avatarColor }}>
                            {isMe ? "You" : m.username}
                          </span>
                          <span className="text-[9px] font-mono text-[#9baab8]">
                            {new Date(m.ts).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className="px-3 py-2 rounded-sm text-sm break-words max-w-[90%]"
                          style={{
                            background: isMe ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.05)",
                            border: isMe
                              ? "1px solid rgba(212,168,67,0.2)"
                              : "1px solid rgba(255,255,255,0.1)",
                            color: isMe ? "#f0ece4" : "#e0e0e0",
                          }}
                        >
                          {m.text}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Message Input */}
            <form
              onSubmit={submit}
              className="p-4 shrink-0 bg-[#0d0d12]"
              style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}
            >
              <div className="flex gap-2 relative">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#12121a] border border-white/10 pl-3 pr-12 py-3 text-sm font-sans rounded-sm outline-none focus:border-[#d4a843] transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 aspect-square grid place-items-center bg-[#d4a843] text-black hover:bg-white rounded-[2px] transition-colors disabled:opacity-40 disabled:hover:bg-[#d4a843]"
                  disabled={!text.trim()}
                  title="Send message"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
