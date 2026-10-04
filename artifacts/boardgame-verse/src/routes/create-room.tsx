import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { useCreateRoom } from "../hooks/useRooms";
import type { GameType, PlayMode } from "../models";

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
  const [playMode, setPlayMode] = useState<PlayMode>("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sameDevice = gameType === "monopoly" && playMode === "LOCAL";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sameDevice && ai >= maxPlayers) return;
    setLoading(true);
    setError(null);
    try {
      if (!auth.user) {
        const guest = `Host${Math.floor(Math.random() * 9999)}`;
        await auth.loginGuest(guest);
      }

      const room = await createRoomMutation.mutateAsync({
        name,
        gameType,
        maxPlayers: sameDevice ? 6 : maxPlayers,
        aiPlayerCount: sameDevice ? 0 : ai,
        isPrivate: sameDevice,
        isLan: false,
      });

      navigate({
        to: "/lobby/$roomId",
        params: { roomId: room.id },
        search: sameDevice ? { mode: "local" } : {},
      });
    } catch (err) {
      console.error("Create room failed", err);
      setError(err instanceof Error ? err.message : "Could not create the room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
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
              {sameDevice && (
                <p className="mt-3 text-xs font-mono text-[#9baab8]">
                  Add each player’s name in the lobby, then start the match on this device.
                </p>
              )}
            </div>
          )}

          {!sameDevice && (
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
                    onClick={() => setMax(Math.min(12, maxPlayers + 1))}
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

          {error && <p className="text-[#e05060] text-sm font-mono">{error}</p>}

          <div className="flex gap-3 pt-4 border-t border-[rgba(212,168,67,0.12)]">
            <NeonButton
              type="submit"
              variant="gold"
              disabled={loading || (!sameDevice && ai >= maxPlayers)}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Room"}
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
