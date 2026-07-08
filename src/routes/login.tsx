import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — GameHub" },
      { name: "description", content: "Sign in to GameHub or play as a guest." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginGuest } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate({ to: "/" });
    } catch {
      // Error toast is already shown by api interceptor.
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    const name = username.trim() || `Guest${Math.floor(Math.random() * 9999)}`;
    setLoading(true);
    try {
      await loginGuest(name);
      navigate({ to: "/" });
    } catch {
      // Error toast is already shown by api interceptor.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20">
        <form onSubmit={submit} className="w-full max-w-md glass-panel p-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2">
            Authenticate
          </div>
          <h1 className="font-display text-5xl italic uppercase mb-8">Sign In</h1>

          <label className="block mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Username
            </span>
            <input
              value={username}
              onChange={(e) => setU(e.target.value)}
              className="mt-1 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono"
              autoFocus
            />
          </label>
          <label className="block mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setP(e.target.value)}
              className="mt-1 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono"
            />
          </label>

          <NeonButton type="submit" disabled={loading} className="w-full mb-3">
            {loading ? "Connecting..." : "Sign In"}
          </NeonButton>
          <NeonButton type="button" variant="ghost" onClick={guest} className="w-full">
            Play as Guest
          </NeonButton>

          <p className="mt-6 text-xs font-mono text-white/40 text-center">
            New player?{" "}
            <Link to="/register" className="text-accent-cyan hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
