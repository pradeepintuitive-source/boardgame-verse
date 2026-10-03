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
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,67,0.05)_0%,transparent_60%)] pointer-events-none" />

        <form
          onSubmit={submit}
          className="w-full max-w-md glass-panel p-10 relative z-10 border border-[rgba(212,168,67,0.2)]"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-2 font-bold">
            Welcome Back
          </div>
          <h1 className="font-display text-5xl font-bold uppercase mb-8 gold-text-glow">Sign In</h1>

          <label className="block mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] block mb-1">
              Username
            </span>
            <input
              value={username}
              onChange={(e) => setU(e.target.value)}
              className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 focus:border-[#d4a843] outline-none font-mono text-white rounded-sm transition-colors"
              autoFocus
            />
          </label>
          <label className="block mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] block mb-1">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setP(e.target.value)}
              className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 focus:border-[#d4a843] outline-none font-mono text-white rounded-sm transition-colors"
            />
          </label>

          <div className="flex justify-end mb-8">
            <button
              type="button"
              className="text-[10px] font-mono text-[#d4a843] hover:underline"
              onClick={() => alert("Forgot password flow not implemented.")}
            >
              Forgot password?
            </button>
          </div>

          <NeonButton variant="gold" type="submit" disabled={loading} className="w-full mb-4">
            {loading ? "Connecting..." : "Sign In"}
          </NeonButton>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(212,168,67,0.12)]"></div>
            </div>
            <div className="relative bg-[#12121a] px-3 text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
              Or
            </div>
          </div>

          <NeonButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={guest}
            className="w-full border-[rgba(255,255,255,0.1)]"
          >
            Play as Guest
          </NeonButton>

          <p className="mt-8 text-xs font-mono text-[#9baab8] text-center">
            New player?{" "}
            <Link to="/register" className="text-[#d4a843] hover:underline font-bold">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
