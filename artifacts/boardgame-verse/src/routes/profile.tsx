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
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-2 font-bold">
          Player Profile
        </div>
        <h1 className="font-display text-5xl font-bold uppercase mb-8 gold-text-glow">Profile</h1>

        <div className="glass-panel p-8 flex items-center gap-6 mb-8 border-[rgba(212,168,67,0.2)]">
          <Avatar name={user.username} color={user.avatarColor} size={80} ring />
          <div className="min-w-0">
            <div className="font-display text-3xl font-bold uppercase truncate text-white">
              {user.username}
            </div>
            <div className="text-xs font-mono text-[#9baab8] uppercase mt-1">
              {user.isGuest ? "Guest Account" : (user.email ?? "Registered")}
            </div>
          </div>
        </div>

        <label className="block mb-8 glass-panel p-8 border-[rgba(212,168,67,0.2)]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] block mb-2">
            Display Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 focus:border-[#d4a843] outline-none font-mono text-white rounded-sm transition-colors"
          />
          <div className="mt-4 flex justify-end">
            <NeonButton
              variant="gold"
              size="sm"
              onClick={() => updateProfile({ username: name.trim() || user.username })}
            >
              Save Changes
            </NeonButton>
          </div>
        </label>

        <div className="glass-panel p-8 border-[rgba(139,35,53,0.3)] bg-[#8b2335]/5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#e05060] mb-4">
            Danger Zone
          </div>
          <NeonButton
            variant="danger"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            Sign Out
          </NeonButton>
        </div>
      </div>
    </AppShell>
  );
}
