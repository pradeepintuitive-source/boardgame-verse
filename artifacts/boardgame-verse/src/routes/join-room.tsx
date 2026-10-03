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
      if (room.gameType === "monopoly" && room.state && ["IN_PROGRESS", "PAUSED"].includes(room.state.toUpperCase()) && room.currentSessionId) {
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
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20">
        <form onSubmit={submit} className="w-full max-w-md glass-panel p-8">
          <p className="eyebrow">Join a table</p>
          <h1 className="page-title mb-8">Enter code</h1>

          {!user && (
            <label className="block mb-4">
              <span className="text-xs font-medium text-white/55">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
              />
            </label>
          )}

          <label className="block mb-2">
            <span className="text-xs font-medium text-white/55">Room code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="field text-center font-display text-3xl uppercase tracking-[0.4em]"
              autoFocus
              required
            />
          </label>
          {errorMessage && <p className="text-destructive text-xs font-mono mb-3">{errorMessage}</p>}

          <NeonButton type="submit" disabled={loading} className="w-full mt-6">
            {loading ? "Joining..." : "Join Game"}
          </NeonButton>
        </form>
      </div>
    </AppShell>
  );
}
