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
      <div className="min-h-screen grid place-items-center px-6 pt-32 pb-20">
        <form onSubmit={submit} className="w-full max-w-md glass-panel p-8">
          <p className="eyebrow">New player</p>
          <h1 className="page-title mb-8">Register</h1>

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
              <span className="text-xs font-medium text-white/55">{f.label}</span>
              <input
                type={f.type}
                value={f.v}
                onChange={(ev) => f.set(ev.target.value)}
                className="field"
                required
              />
            </label>
          ))}

          <NeonButton type="submit" disabled={loading} className="w-full mt-4">
            {loading ? "Creating..." : "Create Account"}
          </NeonButton>

          <p className="mt-6 text-center text-sm text-white/50">
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
