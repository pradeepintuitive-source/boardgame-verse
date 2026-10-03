import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { useLobbyStore } from "../store/lobbyStore";
import { useJoinRoomByCode } from "../hooks/useRooms";

export const Route = createFileRoute("/join-room")({
  head: () => ({
    meta: [
      { title: "Join Room — GameHub" },
      { name: "description", content: "Join a GameHub room with a code." },
    ],
  }),
  component: JoinRoomPage,
});

function JoinRoomPage() {
  const navigate = useNavigate();
  const { user, loginGuest } = useAuth();
  const joinByCode = useJoinRoomByCode();
  const upsertRoom = useLobbyStore((s) => s.upsertRoom);
  const [code, setCode] = useState("");
  const [name, setName] = useState(user?.username ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (!user) {
        const guest = name.trim() || `Guest${Math.floor(Math.random() * 9999)}`;
        await loginGuest(guest);
      }

      const room = await joinByCode.mutateAsync(code.trim());
      upsertRoom(room);
      if (
        room.gameType === "monopoly" &&
        room.state &&
        ["IN_PROGRESS", "PAUSED"].includes(room.state.toUpperCase()) &&
        room.currentSessionId
      ) {
        navigate({ to: "/monopoly/$gameId", params: { gameId: room.currentSessionId } });
      } else {
        navigate({ to: "/lobby/$roomId", params: { roomId: room.id } });
      }
    } catch {
      setErrorMessage("Unable to join this room. Please verify the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,67,0.05)_0%,transparent_60%)] pointer-events-none" />

        <form
          onSubmit={submit}
          className="w-full max-w-md glass-panel p-10 relative z-10 border border-[rgba(212,168,67,0.2)]"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-2 font-bold">
            Join Lobby
          </div>
          <h1 className="font-display text-5xl font-bold uppercase mb-8 gold-text-glow">
            Enter Code
          </h1>

          {!user && (
            <label className="block mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] block mb-1">
                Your Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 focus:border-[#d4a843] outline-none font-mono text-white rounded-sm transition-colors"
                placeholder="Guest"
              />
            </label>
          )}

          <label className="block mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] block mb-1">
              Room Code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 font-display text-3xl tracking-[0.5em] text-center focus:border-[#d4a843] outline-none text-[#d4a843] uppercase rounded-sm transition-colors"
              autoFocus
              required
            />
          </label>
          {errorMessage && (
            <p className="text-[#e05060] text-xs font-mono mt-2 mb-2">{errorMessage}</p>
          )}

          <NeonButton variant="gold" type="submit" disabled={loading} className="w-full mt-6">
            {loading ? "Joining..." : "Join Game"}
          </NeonButton>
        </form>
      </div>
    </AppShell>
  );
}
