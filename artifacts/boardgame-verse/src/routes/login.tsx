import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { apiErrorMessage } from "../services/api";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(username.trim(), password);
      navigate({ to: "/" });
    } catch (err) {
      setErrorMessage(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    const name = username.trim() || `Guest${Math.floor(Math.random() * 9999)}`;
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginGuest(name);
      navigate({ to: "/" });
    } catch (err) {
      setErrorMessage(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20">
        <form onSubmit={submit} className="w-full max-w-md glass-panel p-8">
          <p className="eyebrow">Welcome back</p>
          <h1 className="page-title mb-8">Sign in</h1>

          {errorMessage ? (
            <div className="mb-4 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive font-mono">
              {errorMessage}
            </div>
          ) : null}

          <label className="block mb-4">
            <span className="text-xs font-medium text-white/55">Username or email</span>
            <input
              value={username}
              onChange={(e) => setU(e.target.value)}
              className="field"
              autoFocus
            />
          </label>
          <label className="block mb-8">
            <span className="text-xs font-medium text-white/55">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setP(e.target.value)}
              className="field"
            />
          </label>

          <NeonButton type="submit" disabled={loading} className="w-full mb-3">
            {loading ? "Connecting..." : "Sign In"}
          </NeonButton>
          <NeonButton type="button" variant="ghost" onClick={guest} className="w-full">
            Play as Guest
          </NeonButton>

          <p className="mt-6 text-center text-sm text-white/50">
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
