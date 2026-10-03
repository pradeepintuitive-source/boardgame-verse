import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";
import { apiErrorMessage } from "../services/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — GameHub" },
      { name: "description", content: "Create a GameHub account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [u, setU] = useState("");
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      await register(u.trim(), e.trim(), p);
      navigate({ to: "/" });
    } catch (err) {
      setErrorMessage(apiErrorMessage(err));
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
            Join The Board
          </div>
          <h1 className="font-display text-5xl font-bold uppercase mb-8 gold-text-glow">
            Register
          </h1>

          {errorMessage ? (
            <div className="mb-4 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive font-mono">
              {errorMessage}
            </div>
          ) : null}

          {[
            { label: "Username", v: u, set: setU, type: "text" },
            { label: "Email", v: e, set: setE, type: "email" },
            { label: "Password", v: p, set: setP, type: "password" },
          ].map((f) => (
            <label key={f.label} className="block mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] block mb-1">
                {f.label}
              </span>
              <input
                type={f.type}
                value={f.v}
                onChange={(ev) => f.set(ev.target.value)}
                className="w-full bg-[#0d0d12] border border-[rgba(212,168,67,0.2)] px-4 py-3 focus:border-[#d4a843] outline-none font-mono text-white rounded-sm transition-colors"
                required
              />
            </label>
          ))}

          <NeonButton variant="gold" type="submit" disabled={loading} className="w-full mt-6">
            {loading ? "Creating..." : "Create Account"}
          </NeonButton>

          <p className="mt-8 text-xs font-mono text-[#9baab8] text-center">
            Already registered?{" "}
            <Link to="/login" className="text-[#d4a843] hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
