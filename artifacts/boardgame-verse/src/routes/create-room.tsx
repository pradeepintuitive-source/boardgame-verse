import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { useCreateRoom } from "../hooks/useRooms";
import type { GameType, PlayMode } from "../models";
import { roomsApi } from "../services/rooms";
import { gamesApi } from "../services/games";

export const Route = createFileRoute("/create-room")({
  head: () => ({
    meta: [
      { title: "Create Room — GameHub" },
      { name: "description", content: "Spin up a new GameHub room." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { game?: GameType } => ({
    game: (s.game as GameType | undefined) ?? "mafia",
  }),
  component: CreateRoomPage,
});

function CreateRoomPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const auth = useAuth();
  const createRoomMutation = useCreateRoom();

  const [name, setName] = useState("My Game Room");
  const [gameType, setGameType] = useState<GameType>(search.game ?? "mafia");
  const [maxPlayers, setMax] = useState(3);
  const [ai, setAi] = useState(0);
  const [isPrivate, setPrivate] = useState(false);
  const [isLan, setLan] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("ONLINE");
  const [names, setNames] = useState(["Player 1", "Player 2"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sameDevice = gameType === "monopoly" && playMode === "LOCAL";

  const setPlayerCount = (next: number) => {
    const count = Math.min(6, Math.max(2, next));
    setNames((current) => {
      const copy = current.slice(0, count);
      while (copy.length < count) copy.push(`Player ${copy.length + 1}`);
      return copy;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sameDevice && ai >= maxPlayers) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!auth.user) {
        const guest = `Host${Math.floor(Math.random() * 9999)}`;
        await auth.loginGuest(guest);
      }

      const seatedNames = names.map((entry, index) => entry.trim() || `Player ${index + 1}`);
      const room = await createRoomMutation.mutateAsync({
        name,
        gameType,
        maxPlayers: sameDevice ? seatedNames.length : maxPlayers,
        aiPlayerCount: sameDevice ? 0 : ai,
        isPrivate: sameDevice ? true : isPrivate,
        isLan: sameDevice ? false : isLan,
        playMode: sameDevice ? "LOCAL" : "ONLINE",
      });

      if (!sameDevice) {
        navigate({ to: "/lobby/$roomId", params: { roomId: room.id } });
        return;
      }

      const seated = await roomsApi.addLocalPlayers(room.id, seatedNames);
      const started = await roomsApi.start(seated.id);
      const sessionId = started.sessionId;
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          await gamesApi.snapshot(sessionId);
          break;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
      navigate({ to: "/monopoly/$gameId", params: { gameId: sessionId } });
    } catch (err) {
      console.error("Create room failed", err);
      setError(err instanceof Error ? err.message : "Could not start the match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto">
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-2">
          New Match
        </div>
        <h1 className="font-display text-5xl font-bold uppercase mb-8 gold-text-glow">
          Create Room
        </h1>

        <form onSubmit={submit} className="glass-panel p-8 space-y-6">
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1 block">
              Room Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 font-mono focus:border-[#d4a843] outline-none text-white rounded-sm transition-colors"
              required
            />
          </label>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-2 block">
              Game Type
            </span>
            <div className="grid grid-cols-2 gap-4">
              {(["mafia", "monopoly"] as GameType[]).map((g) => {
                const isActive = gameType === g;
                const title = g === "monopoly" ? "Bharat Business" : "Mafia";
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGameType(g)}
                    className={[
                      "p-4 border rounded-sm text-left transition-all cursor-pointer h-24 flex flex-col justify-end relative overflow-hidden",
                      isActive
                        ? "border-[#d4a843] bg-[rgba(212,168,67,0.1)] shadow-[0_0_15px_rgba(212,168,67,0.15)]"
                        : "border-[rgba(255,255,255,0.1)] bg-[#0d0d12] hover:border-[rgba(212,168,67,0.4)]",
                    ].join(" ")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
                    <span
                      className={[
                        "font-display text-2xl font-bold uppercase relative z-10",
                        isActive ? "text-[#d4a843]" : "text-white/60",
                      ].join(" ")}
                    >
                      {title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {gameType === "monopoly" && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-2 block">
                Where to play
              </span>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["ONLINE", "Multiple devices"],
                    ["LOCAL", "Same device"],
                  ] as const
                ).map(([mode, label]) => {
                  const active = playMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPlayMode(mode)}
                      className={[
                        "p-4 border rounded-sm text-left transition-all cursor-pointer",
                        active
                          ? "border-[#d4a843] bg-[rgba(212,168,67,0.1)]"
                          : "border-[rgba(255,255,255,0.1)] bg-[#0d0d12] hover:border-[rgba(212,168,67,0.4)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "font-display text-lg font-bold uppercase",
                          active ? "text-[#d4a843]" : "text-white/60",
                        ].join(" ")}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sameDevice ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1 block">
                  Players on this device
                </span>
                <div className="flex items-center h-[46px] bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] rounded-sm">
                  <button
                    type="button"
                    onClick={() => setPlayerCount(names.length - 1)}
                    disabled={names.length <= 2}
                    className="grid h-full w-12 place-items-center text-white/60 hover:bg-white/5 hover:text-[#d4a843] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center font-mono text-white">{names.length}</div>
                  <button
                    type="button"
                    onClick={() => setPlayerCount(names.length + 1)}
                    disabled={names.length >= 6}
                    className="grid h-full w-12 place-items-center text-white/60 hover:bg-white/5 hover:text-[#d4a843] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
              {names.map((playerName, index) => (
                <label key={index} className="block">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1 block">
                    Player {index + 1}
                  </span>
                  <input
                    value={playerName}
                    onChange={(e) =>
                      setNames((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? e.target.value : entry,
                        ),
                      )
                    }
                    placeholder={`Player ${index + 1}`}
                    className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 font-mono focus:border-[#d4a843] outline-none text-white rounded-sm transition-colors"
                  />
                </label>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1 block">
                Max Players
              </span>
              <div className="flex items-center h-[46px] bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] rounded-sm">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(2, maxPlayers - 1);
                    setMax(next);
                    setAi((current) => Math.min(current, Math.max(0, next - 1)));
                  }}
                  disabled={maxPlayers <= 2}
                  className="grid h-full w-12 place-items-center text-white/60 hover:bg-white/5 hover:text-[#d4a843] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>
                <div className="flex-1 text-center font-mono text-white">{maxPlayers}</div>
                <button
                  type="button"
                  onClick={() => setMax(Math.min(16, maxPlayers + 1))}
                  className="w-12 h-full text-white/60 hover:text-[#d4a843] hover:bg-white/5 grid place-items-center"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-1 block">
                AI Players
              </span>
              <div className="flex items-center h-[46px] bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] rounded-sm">
                <button
                  type="button"
                  onClick={() => setAi(Math.max(0, ai - 1))}
                  className="w-12 h-full text-white/60 hover:text-[#d4a843] hover:bg-white/5 grid place-items-center"
                >
                  −
                </button>
                <div className="flex-1 text-center font-mono text-white">{ai}</div>
                <button
                  type="button"
                  onClick={() => setAi(Math.min(maxPlayers - 1, ai + 1))}
                  className="w-12 h-full text-white/60 hover:text-[#d4a843] hover:bg-white/5 grid place-items-center"
                >
                  +
                </button>
              </div>
              {ai >= maxPlayers && (
                <div className="text-[#8b2335] text-[10px] font-mono mt-1">
                  Cannot equal max players
                </div>
              )}
            </div>
          </div>
          )}

          {!sameDevice && (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(212,168,67,0.4)] bg-[#0d0d12] cursor-pointer rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setPrivate(e.target.checked)}
                className="accent-[#d4a843] size-4"
              />
              <span className="text-xs font-mono uppercase tracking-widest text-white/80">
                Private
              </span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(212,168,67,0.4)] bg-[#0d0d12] cursor-pointer rounded-sm transition-colors">
              <input
                type="checkbox"
                checked={isLan}
                onChange={(e) => setLan(e.target.checked)}
                className="accent-[#d4a843] size-4"
              />
              <span className="text-xs font-mono uppercase tracking-widest text-white/80">
                LAN Mode
              </span>
            </label>
          </div>
          )}

          {error && <p className="text-[#e05060] text-sm font-mono">{error}</p>}

          <div className="flex gap-3 pt-4 border-t border-[rgba(212,168,67,0.12)]">
            <NeonButton
              type="submit"
              variant="gold"
              disabled={loading || (!sameDevice && ai >= maxPlayers)}
              className="flex-1"
            >
              {loading ? "Creating..." : sameDevice ? "Start Match" : "Create Room"}
            </NeonButton>
            <NeonButton type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
              Cancel
            </NeonButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
