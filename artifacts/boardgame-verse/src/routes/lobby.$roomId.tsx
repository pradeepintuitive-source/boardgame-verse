import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Crown, UserPlus, X, Bot, Wifi, Lock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { Avatar } from "../components/common/Avatar";
import { ChatDrawer } from "../components/chat/ChatDrawer";
import { useLobbyStore } from "../store/lobbyStore";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import { initMafiaGame } from "../utils/mafiaEngine";
import { useMonopolyStore } from "../store/monopolyStore";
import { useRoom, useStartGame, useLeaveRoom } from "../hooks/useRooms";
import { useStompSubscription } from "../hooks/useStompSubscription";
import { Topics } from "../websocket/topics";
import { stomp } from "../websocket/stompClient";
import { useConnectionStore } from "../store/connectionStore";
import { useWebsocketRequestStore } from "../store/requestStore";
import { VoiceChatPanel } from "../components/voice/VoiceChatPanel";

export const Route = createFileRoute("/lobby/$roomId")({
  head: () => ({
    meta: [
      { title: "Lobby — GameHub" },
      { name: "description", content: "Waiting room before the match starts." },
    ],
  }),
  component: LobbyPage,
});

function LobbyPage() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const { addAI, removePlayer } = useLobbyStore();
  const user = useAuthStore((s) => s.user);
  const setMafia = useGameStore((s) => s.setMafia);
  const wsConnected = useConnectionStore((s) => s.connected);
  const roomQuery = useRoom(roomId);
  const qc = useQueryClient();
  const startGameMut = useStartGame();
  const leaveMut = useLeaveRoom();

  // Live-sync: refresh the room whenever the server broadcasts a change.
  useStompSubscription(
    roomId ? Topics.room(roomId) : null,
    () => {
      useWebsocketRequestStore.getState().completeAllRequests();
      qc.invalidateQueries({ queryKey: ["room", roomId] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
    !!roomId,
  );

  // Listen for backend game lifecycle broadcasts for this room (GAME_STARTED, etc.)
  useStompSubscription<any>(
    roomId ? Topics.gameRoom(roomId) : null,
    (msg) => {
      try {
        if (!msg || msg.type !== "GAME_STARTED") return;
        const sessionId = msg.sessionId as string | undefined;
        if (sessionId) {
          navigate({ to: "/monopoly/$gameId", params: { gameId: sessionId } });
        }
      } catch (e) {
        console.error("Failed handling GAME_STARTED message", e);
      }
    },
    !!roomId,
  );

  useEffect(() => {
    if (!roomQuery.data || roomQuery.data.gameType !== "monopoly") return;
    const room = roomQuery.data;
    if (["IN_PROGRESS", "PAUSED"].includes(room.state.toUpperCase()) && room.currentSessionId) {
      navigate({ to: "/monopoly/$gameId", params: { gameId: room.currentSessionId } });
    }
  }, [roomQuery.data, navigate]);

  // Polling fallback while the socket isn't connected so joins still surface.
  useEffect(() => {
    if (wsConnected || !roomId) return;
    const t = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["room", roomId] });
    }, 3000);
    return () => clearInterval(t);
  }, [wsConnected, roomId, qc]);

  const room = roomQuery.data;
  const [copied, setCopied] = useState(false);
  const pendingRequests = useWebsocketRequestStore((s) => s.pendingRequests);
  const pendingReady = pendingRequests.some((req) => req.action === "READY");

  if (!room) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32 text-center">
          <div>
            <p className="text-white/60 mb-6 font-mono">
              {roomQuery.isLoading ? "Loading room…" : "This room no longer exists."}
            </p>
            <NeonButton onClick={() => navigate({ to: "/" })}>Back Home</NeonButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const isHost = user?.id === room.hostId;
  const localPlay = room.playMode === "LOCAL";
  const minPlayers = 2;
  const allReady = localPlay
    ? room.players.length >= minPlayers
    : room.players.every((p) => p.ready) && room.players.length >= minPlayers;

  const copy = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const start = async () => {
    if (room.gameType === "mafia") {
      const gameId = room.id;
      setMafia(gameId, initMafiaGame(gameId, room.players));
      navigate({ to: "/mafia/$gameId", params: { gameId } });
      return;
    }

    if (room.gameType === "monopoly") {
      try {
        const response = await startGameMut.mutateAsync(room.id);
        const sessionId = response.sessionId;
        // Poll the games snapshot endpoint until it's available to avoid hydration race
        const maxAttempts = 6;
        let ok = false;
        for (let i = 0; i < maxAttempts; i++) {
          try {
            await import("../services/games").then((m) => m.gamesApi.snapshot(sessionId));
            ok = true;
            break;
          } catch (e) {
            // wait briefly then retry

            await new Promise((r) => setTimeout(r, 300));
          }
        }
        if (!ok) {
          console.warn("Snapshot not ready after start; navigating anyway");
        }
        navigate({ to: "/monopoly/$gameId", params: { gameId: sessionId } });
      } catch (error) {
        console.error("Failed to start Monopoly game", error);
      }
    }
  };

  const me = room.players.find((p) => p.userId === user?.id);
  const myReady = !!me?.ready;
  const handleToggleReady = () => {
    if (!me) return;
    const dest = Topics.send.roomReady(room.id);
    const { sent, requestId } = stomp.sendTrackedMessage(dest, { ready: !myReady }, "READY", {
      roomId: room.id,
    });
    if (!sent) {
      console.warn("[lobby] STOMP ready toggle failed", dest, { requestId, ready: !myReady });
    }
  };

  const handleLeave = () => {
    leaveMut.mutate(room.id, {
      onSettled: () => navigate({ to: "/" }),
    });
  };

  return (
    <AppShell>
      <div className="min-h-screen px-6 pt-28 pb-32 max-w-5xl mx-auto">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-8">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-1">
              Lobby · {room.gameType === "monopoly" ? "Bharat Business" : "Mafia"}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold uppercase truncate gold-text-glow">
              {room.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="size-3" /> {localPlay ? "Same device" : room.isLan ? "LAN" : "Online"}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                {room.isPrivate ? (
                  <>
                    <Lock className="size-3" /> Private
                  </>
                ) : (
                  "Public"
                )}
              </span>
              <span>·</span>
              <span>
                {room.players.length}/{room.maxPlayers} Seats
              </span>
            </div>
          </div>
          {!localPlay && (
          <button
            onClick={copy}
            className="glass-panel border border-[rgba(212,168,67,0.3)] px-5 py-3 hover:border-[#d4a843] hover:bg-[rgba(212,168,67,0.05)] transition-colors text-left group"
          >
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#9baab8]">
              Room Code
            </div>
            <div className="font-display text-3xl tracking-[0.2em] text-[#d4a843] inline-flex items-center gap-3">
              {room.code}
              <Copy className="size-5 text-[#d4a843]/50 group-hover:text-[#d4a843] transition-colors" />
            </div>
            <div className="text-[9px] font-mono text-[#d4a843]/80 h-3 mt-1">
              {copied ? "COPIED TO CLIPBOARD" : "TAP TO COPY"}
            </div>
          </button>
          )}
        </header>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <section>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-3">
              Connected Players ({room.players.length})
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {room.players.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`glass-panel border p-4 flex items-center gap-3 transition-colors ${
                      p.ready
                        ? "border-[#d4a843] bg-[rgba(212,168,67,0.05)]"
                        : "border-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <Avatar name={p.username} color={p.avatarColor} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate text-white">{p.username}</span>
                        {p.isHost && <Crown className="size-3.5 text-[#d4a843]" />}
                        {p.isAI && <Bot className="size-3.5 text-[#9baab8]" />}
                      </div>
                      <div
                        className={`text-[10px] font-mono uppercase tracking-widest ${
                          p.ready ? "text-[#d4a843]" : "text-[#9baab8]"
                        }`}
                      >
                        {localPlay ? "On this device" : p.ready ? "READY" : "WAITING"}
                      </div>
                    </div>
                    {isHost && !p.isHost && !localPlay && (
                      <button
                        onClick={() => removePlayer(room.id, p.id)}
                        className="size-8 grid place-items-center hover:bg-[#8b2335]/20 hover:text-[#e05060] rounded-sm transition-colors text-white/40"
                        aria-label="Remove"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    {p.userId === user?.id && !p.isAI && !localPlay && (
                      <button
                        onClick={handleToggleReady}
                        disabled={pendingReady}
                        className={`text-[10px] font-mono uppercase tracking-widest px-3 py-2 border transition-colors rounded-sm disabled:opacity-60 min-h-[44px] ${
                          p.ready
                            ? "border-[#d4a843] text-[#d4a843] bg-[rgba(212,168,67,0.1)]"
                            : "border-[rgba(255,255,255,0.2)] text-white hover:border-[#d4a843] hover:text-[#d4a843]"
                        }`}
                      >
                        {pendingReady ? "Pending…" : p.ready ? "Not Ready" : "Ready"}
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {!localPlay &&
              room.players.length < room.maxPlayers &&
                Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4 flex items-center justify-center gap-3 min-h-[78px] animate-pulse"
                  >
                    <div className="size-8 rounded-full border-2 border-dashed border-white/20 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                      Waiting for player…
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <aside className="space-y-4">
            {isHost && (
              <div className="glass-panel p-6 border-[rgba(212,168,67,0.3)] bg-[rgba(212,168,67,0.05)]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4a843] mb-4">
                  Host Command Panel
                </div>
                {!localPlay && (
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => addAI(room.id)}
                  disabled={room.players.length >= room.maxPlayers}
                  className="w-full mb-4 inline-flex items-center justify-center gap-2 border-[rgba(212,168,67,0.4)] text-[#d4a843] hover:bg-[#d4a843] hover:text-[#0d0d12]"
                >
                  <UserPlus className="size-4" /> Add AI Player
                </NeonButton>
                )}
                <NeonButton
                  variant="gold"
                  size="md"
                  disabled={!allReady}
                  onClick={start}
                  className="w-full"
                >
                  {allReady
                    ? "Start Match"
                    : `Need ${Math.max(0, minPlayers - room.players.length)} more`}
                </NeonButton>
              </div>
            )}

            <NeonButton
              variant={isHost ? "danger" : "ghost"}
              size="sm"
              onClick={handleLeave}
              disabled={leaveMut.isPending}
              className="w-full inline-flex items-center justify-center gap-2"
            >
              <LogOut className="size-4" />
              {isHost ? "Close & Leave Room" : "Leave Room"}
            </NeonButton>

            {user?.id && (
              <VoiceChatPanel
                roomId={room.id}
                selfUserId={user.id}
                userLookup={Object.fromEntries(
                  room.players.map((player) => [
                    player.userId,
                    {
                      username: player.username,
                      avatarColor: player.avatarColor,
                    },
                  ]),
                )}
              />
            )}

            <div className="glass-panel p-5 text-xs font-mono text-white/50 leading-relaxed">
              {localPlay
                ? "Pass this device between players when the turn changes. The match is saved on the server, so the host can resume it later."
                : "Share the room code with friends, or fill seats with AI players. The host starts the match when everyone is ready. You can rejoin any room later from Join Game using the room code."}
            </div>
          </aside>
        </div>
      </div>

      <ChatDrawer roomId={room.id} />
    </AppShell>
  );
}
