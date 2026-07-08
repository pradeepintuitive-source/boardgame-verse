import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { useAuth } from "../providers/AuthProvider";

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

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await register(u.trim(), e.trim(), p);
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
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-pink mb-2">
            New Operator
          </div>
          <h1 className="font-display text-5xl italic uppercase mb-8">Register</h1>

          {[
            { label: "Username", v: u, set: setU, type: "text" },
            { label: "Email", v: e, set: setE, type: "email" },
            { label: "Password", v: p, set: setP, type: "password" },
          ].map((f) => (
            <label key={f.label} className="block mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                {f.label}
              </span>
              <input
                type={f.type}
                value={f.v}
                onChange={(ev) => f.set(ev.target.value)}
                className="mt-1 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono"
                required
              />
            </label>
          ))}

          <NeonButton type="submit" disabled={loading} className="w-full mt-4">
            {loading ? "Creating..." : "Create Account"}
          </NeonButton>

          <p className="mt-6 text-xs font-mono text-white/40 text-center">
            Already registered?{" "}
            <Link to="/login" className="text-accent-cyan hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
