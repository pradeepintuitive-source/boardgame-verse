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
import { useRoom, useStartGame, useToggleReady, useLeaveRoom } from "../hooks/useRooms";
import { useStompSubscription } from "../hooks/useStompSubscription";
import { Topics } from "../websocket/topics";
import { useConnectionStore } from "../store/connectionStore";

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
  const toggleReadyMut = useToggleReady();
  const startGameMut = useStartGame();
  const leaveMut = useLeaveRoom();

  // Live-sync: refresh the room whenever the server broadcasts a change.
  useStompSubscription(
    roomId ? Topics.room(roomId) : null,
    () => {
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
  const minPlayers = room.gameType === "monopoly" ? 2 : 3;
  const allReady = room.players.every((p) => p.ready) && room.players.length >= minPlayers;

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
            // eslint-disable-next-line no-await-in-loop
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
    toggleReadyMut.mutate({ roomId: room.id, ready: !myReady });
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
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-1">
              Lobby · {room.gameType}
            </div>
            <h1 className="font-display text-4xl md:text-6xl italic uppercase truncate">
              {room.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="size-3" /> {room.isLan ? "LAN" : "Online"}
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
          <button
            onClick={copy}
            className="glass-panel border border-accent-cyan/30 px-4 py-3 hover:border-accent-cyan transition-colors text-left"
          >
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
              Room Code
            </div>
            <div className="font-display text-2xl tracking-[0.3em] text-accent-cyan inline-flex items-center gap-2">
              {room.code}
              <Copy className="size-4" />
            </div>
            <div className="text-[9px] font-mono text-accent-cyan/60 h-3">
              {copied ? "COPIED" : "\u00a0"}
            </div>
          </button>
        </header>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <section>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">
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
                    className={`glass-panel border p-4 flex items-center gap-3 ${p.ready ? "border-accent-cyan/40" : "border-white/10"}`}
                  >
                    <Avatar name={p.username} color={p.avatarColor} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{p.username}</span>
                        {p.isHost && <Crown className="size-3.5 text-accent-amber" />}
                        {p.isAI && <Bot className="size-3.5 text-accent-cyan" />}
                      </div>
                      <div
                        className={`text-[10px] font-mono uppercase tracking-widest ${p.ready ? "text-accent-cyan" : "text-white/40"}`}
                      >
                        {p.ready ? "READY" : "WAITING"}
                      </div>
                    </div>
                    {isHost && !p.isHost && (
                      <button
                        onClick={() => removePlayer(room.id, p.id)}
                        className="size-7 grid place-items-center hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    {p.userId === user?.id && !p.isAI && (
                      <button
                        onClick={handleToggleReady}
                        disabled={toggleReadyMut.isPending}
                        className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 border transition-colors disabled:opacity-50 ${
                          p.ready
                            ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                            : "border-white/20 hover:border-accent-cyan"
                        }`}
                      >
                        {p.ready ? "Ready" : "Not Ready"}
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {room.players.length < room.maxPlayers &&
                Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="border border-dashed border-white/10 p-4 grid place-items-center text-[10px] font-mono uppercase tracking-widest text-white/30"
                  >
                    Open Seat
                  </div>
                ))}
            </div>
          </section>

          <aside className="space-y-4">
            {isHost && (
              <div className="glass-panel p-5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-3">
                  Host Controls
                </div>
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => addAI(room.id)}
                  disabled={room.players.length >= room.maxPlayers}
                  className="w-full mb-3 inline-flex items-center justify-center gap-2"
                >
                  <UserPlus className="size-3.5" /> Add AI Player
                </NeonButton>
                <NeonButton size="md" disabled={!allReady} onClick={start} className="w-full">
                  {allReady
                    ? "Start Match"
                    : `Need ${Math.max(0, minPlayers - room.players.length)} more`}
                </NeonButton>
              </div>
            )}

            <NeonButton
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              disabled={leaveMut.isPending}
              className="w-full inline-flex items-center justify-center gap-2"
            >
              <LogOut className="size-3.5" />
              {isHost ? "Close & Leave Room" : "Leave Room"}
            </NeonButton>

            <div className="glass-panel p-5 text-xs font-mono text-white/50 leading-relaxed">
              Share the room code with friends, or fill seats with AI players. The host starts the
              match when everyone is ready. You can rejoin any room later from Join Game using the
              room code.
            </div>
          </aside>
        </div>
      </div>

      <ChatDrawer roomId={room.id} />
    </AppShell>
  );
}
