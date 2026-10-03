import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { Avatar } from "../components/common/Avatar";
import { useAuthStore } from "../store/authStore";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — GameHub" },
      { name: "description", content: "Manage your GameHub profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();
  const [name, setName] = useState(user?.username ?? "");

  if (!user) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32">
          <div className="text-center">
            <p className="text-white/60 mb-6">You're not signed in.</p>
            <NeonButton onClick={() => navigate({ to: "/login" })}>Sign In</NeonButton>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto">
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2">
          Operator
        </div>
        <h1 className="font-display text-5xl italic uppercase mb-8">Profile</h1>

        <div className="glass-panel p-6 flex items-center gap-6 mb-6">
          <Avatar name={user.username} color={user.avatarColor} size={80} ring />
          <div className="min-w-0">
            <div className="font-display text-3xl italic uppercase truncate">{user.username}</div>
            <div className="text-xs font-mono text-white/40 uppercase">
              {user.isGuest ? "Guest Account" : (user.email ?? "Registered")}
            </div>
          </div>
        </div>

        <label className="block mb-6 glass-panel p-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
            Display Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono"
          />
          <div className="mt-3 flex justify-end">
            <NeonButton
              size="sm"
              onClick={() => updateProfile({ username: name.trim() || user.username })}
            >
              Save
            </NeonButton>
          </div>
        </label>

        <NeonButton
          variant="ghost"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
        >
          Sign Out
        </NeonButton>
      </div>
    </AppShell>
  );
}
