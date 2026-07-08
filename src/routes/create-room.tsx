import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { useCreateRoom } from "../hooks/useRooms";
import type { GameType } from "../models";

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
  const [maxPlayers, setMax] = useState(8);
  const [ai, setAi] = useState(3);
  const [isPrivate, setPrivate] = useState(false);
  const [isLan, setLan] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit clicked and working...asd and working fine");
    setLoading(true);
    try {
      if (!auth.user) {
        const guest = `Host${Math.floor(Math.random() * 9999)}`;
        await auth.loginGuest(guest);
      }
      console.log("Before mutate");

      const room = await createRoomMutation.mutateAsync({
        name,
        gameType,
        maxPlayers,
        aiPlayerCount: ai,
        isPrivate,
        isLan,
      });

      console.log("After mutate", room);
      console.log("Navigating to lobby", room.id, room.code);
      navigate({ to: "/lobby/$roomId", params: { roomId: room.id } });
    } catch (error) {
      console.error("Create room failed", error);
      // Error toast is already shown by api interceptor.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto">
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2">
          Pradeep <span className="text-white/60 ml-2">debug instrumentation active</span>
        </div>
        <h1 className="font-display text-5xl italic uppercase mb-8">Create Room</h1>

        <form onSubmit={submit} className="glass-panel p-6 space-y-5">
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Room Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none"
              required
            />
          </label>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Game Type
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["mafia", "monopoly"] as GameType[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={g === "monopoly"}
                  onClick={() => setGameType(g)}
                  className={`p-4 border font-display text-2xl italic uppercase transition-all ${
                    gameType === g
                      ? "border-accent-cyan text-accent-cyan shadow-[var(--shadow-neon-cyan)]"
                      : "border-white/10 text-white/60 hover:border-white/40"
                  } ${g === "monopoly" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {g}
                  {g === "monopoly" && (
                    <div className="text-[9px] font-mono tracking-widest text-white/40 mt-1">
                      SOON
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Max Players
              </span>
              <input
                type="number"
                min={3}
                max={16}
                value={maxPlayers}
                onChange={(e) => setMax(Number(e.target.value))}
                className="mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                AI Players
              </span>
              <input
                type="number"
                min={0}
                max={maxPlayers - 1}
                value={ai}
                onChange={(e) => setAi(Number(e.target.value))}
                className="mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setPrivate(e.target.checked)}
                className="accent-[var(--accent-cyan)] size-4"
              />
              <span className="text-sm font-mono uppercase tracking-widest">Private</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={isLan}
                onChange={(e) => setLan(e.target.checked)}
                className="accent-[var(--accent-cyan)] size-4"
              />
              <span className="text-sm font-mono uppercase tracking-widest">LAN Mode</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <NeonButton type="submit" disabled={loading} className="flex-1">
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
