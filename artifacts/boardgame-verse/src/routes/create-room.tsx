import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { useCreateRoom } from "../hooks/useRooms";
import type { GameType } from "../models";

const normalizeIntegerInput = (value: string) =>
  value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");

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
  const [maxPlayers, setMax] = useState("3");
  const [ai, setAi] = useState("0");
  const [isPrivate, setPrivate] = useState(false);
  const [isLan, setLan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const minPlayers = gameType === "monopoly" ? 2 : 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxPlayersValue = Number(maxPlayers);
    const aiPlayerCount = Number(ai);
    if (maxPlayersValue < minPlayers || maxPlayersValue > 16) {
      setInputError(`Max players must be between ${minPlayers} and 16.`);
      return;
    }
    if (aiPlayerCount > maxPlayersValue - 1) {
      setInputError("AI players cannot exceed the available seats.");
      return;
    }
    setInputError("");
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
        maxPlayers: maxPlayersValue,
        aiPlayerCount,
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
      <div className="mx-auto min-h-screen max-w-2xl px-6 pb-20 pt-28">
        <p className="eyebrow">New match</p>
        <h1 className="page-title mb-8">Create room</h1>

        <form onSubmit={submit} className="glass-panel space-y-5 p-6 md:p-8">
          <label className="block">
            <span className="text-xs font-medium text-white/55">Room name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              required
            />
          </label>

          <div>
            <span className="text-xs font-medium text-white/55">Game</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["mafia", "monopoly"] as GameType[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGameType(g)}
                  className={`cursor-pointer rounded-2xl border p-4 text-left font-display text-2xl italic uppercase transition-all ${
                    gameType === g
                      ? "border-accent-cyan/70 bg-accent-cyan/10 text-accent-cyan"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-white/55">Max players</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxPlayers}
                onChange={(e) => {
                  setMax(normalizeIntegerInput(e.target.value));
                  setInputError("");
                }}
                className="field"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/55">AI players</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={ai}
                onChange={(e) => {
                  setAi(normalizeIntegerInput(e.target.value));
                  setInputError("");
                }}
                className="field"
                required
              />
            </label>
          </div>
          {inputError && (
            <p role="alert" className="text-sm text-red-400">
              {inputError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setPrivate(e.target.checked)}
                className="accent-[var(--accent-cyan)] size-4"
              />
              <span className="text-sm font-medium">Private</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <input
                type="checkbox"
                checked={isLan}
                onChange={(e) => setLan(e.target.checked)}
                className="accent-[var(--accent-cyan)] size-4"
              />
              <span className="text-sm font-medium">LAN mode</span>
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
