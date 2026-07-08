import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuthStore } from "../store/authStore";
import { useLobbyStore } from "../store/lobbyStore";
import { pickAvatarColor, uid } from "../utils/ids";

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
  const user = useAuthStore((s) => s.user);
  const loginGuest = useAuthStore((s) => s.loginGuest);
  const joinByCode = useLobbyStore((s) => s.joinByCode);
  const [code, setCode] = useState("");
  const [name, setName] = useState(user?.username ?? "");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    let me = user;
    if (!me) {
      const guest = name.trim() || `Guest${Math.floor(Math.random() * 9999)}`;
      loginGuest(guest);
      me = { id: uid("usr"), username: guest, avatarColor: pickAvatarColor(guest), isGuest: true };
    }
    const room = joinByCode(code.trim(), {
      id: me.id,
      username: me.username,
      avatarColor: me.avatarColor,
    });
    if (!room) {
      setErr("Room not found or full.");
      return;
    }
    navigate({ to: "/lobby/$roomId", params: { roomId: room.id } });
  };

  return (
    <AppShell>
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20">
        <form onSubmit={submit} className="w-full max-w-md glass-panel p-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-pink mb-2">
            Join Lobby
          </div>
          <h1 className="font-display text-5xl italic uppercase mb-8">Enter Code</h1>

          {!user && (
            <label className="block mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Your Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none"
              />
            </label>
          )}

          <label className="block mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Room Code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="mt-1 w-full bg-background border border-white/10 px-3 py-3 font-display text-3xl tracking-[0.5em] text-center focus:border-accent-cyan outline-none uppercase"
              autoFocus
              required
            />
          </label>
          {err && <p className="text-destructive text-xs font-mono mb-3">{err}</p>}

          <NeonButton type="submit" className="w-full mt-6">
            Join Game
          </NeonButton>
        </form>
      </div>
    </AppShell>
  );
}
