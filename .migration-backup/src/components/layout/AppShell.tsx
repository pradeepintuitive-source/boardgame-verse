import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Avatar } from "../common/Avatar";
import { ParticleField } from "../common/ParticleField";
import { useAuthStore } from "../../store/authStore";
import { useConnectionStore } from "../../store/connectionStore";
import { useSettingsStore } from "../../store/settingsStore";

export function AppShell({
  children,
  hideChrome = false,
}: {
  children: ReactNode;
  hideChrome?: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const conn = useConnectionStore();
  const showLatency = useSettingsStore((s) => s.showLatency);
  const router = useRouter();

  useEffect(() => {
    conn.init();
  }, [conn]);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* radial glow + grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "var(--gradient-radial-glow)" }}
      />
      <ParticleField />

      {!hideChrome && (
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5">
          <Link
            to="/"
            className="font-display text-2xl tracking-tighter italic uppercase neon-text-glow text-white"
          >
            GameHub
          </Link>
          <div className="hidden md:flex gap-8 text-[11px] font-mono tracking-widest text-foreground/40">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="hover:text-accent-cyan transition-colors"
              activeProps={{ className: "text-accent-cyan" }}
            >
              HOME
            </Link>
            <Link
              to="/profile"
              className="hover:text-accent-cyan transition-colors"
              activeProps={{ className: "text-accent-cyan" }}
            >
              PROFILE
            </Link>
            <Link
              to="/settings"
              className="hover:text-accent-cyan transition-colors"
              activeProps={{ className: "text-accent-cyan" }}
            >
              SETTINGS
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20">
              <div
                className={`w-1.5 h-1.5 rounded-full ${conn.reconnecting ? "bg-accent-amber animate-pulse" : "bg-accent-cyan animate-pulse"}`}
              />
              <span className="text-[10px] font-mono text-accent-cyan tracking-widest">
                {conn.reconnecting ? "RECONNECTING" : conn.connected ? "ONLINE" : "OFFLINE MODE"}
              </span>
            </div>
            {user ? (
              <button
                onClick={() => router.navigate({ to: "/profile" })}
                className="cursor-pointer"
              >
                <Avatar name={user.username} color={user.avatarColor} size={36} ring />
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest border border-white/20 hover:border-accent-cyan hover:text-accent-cyan transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}

      <div className="relative z-10">{children}</div>

      {!hideChrome && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 p-6 flex justify-between items-end pointer-events-none">
          <div className="flex flex-col gap-1 pointer-events-auto">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
              System Status
            </span>
            {showLatency && (
              <span className="text-[11px] font-mono text-accent-cyan uppercase">
                Server: EU-WEST ({conn.latencyMs ?? "—"}ms)
              </span>
            )}
          </div>
          <div className="pointer-events-auto hidden md:flex items-center gap-3 text-[10px] font-mono text-white/40 tracking-widest">
            <span>v1.0.0</span>
            <span>·</span>
            <span>GAMEHUB</span>
          </div>
        </footer>
      )}
    </div>
  );
}
