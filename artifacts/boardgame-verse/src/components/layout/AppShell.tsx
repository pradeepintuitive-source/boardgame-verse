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
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground">
      {/* radial glow + grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "var(--gradient-radial-glow)" }}
      />
      <ParticleField />

      {!hideChrome && (
        <nav className="fixed top-0 left-0 right-0 z-40 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 md:px-10 md:py-5">
          <Link
            to="/"
            className="font-display text-xl tracking-tighter uppercase gold-text-glow text-white font-bold md:text-2xl"
          >
            GameHub
          </Link>
          <div className="order-3 flex w-full justify-center gap-5 text-[10px] font-mono tracking-widest text-[#9baab8] md:order-none md:w-auto md:gap-8 md:text-[11px]">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="hover:text-[#d4a843] transition-colors"
              activeProps={{ className: "text-[#d4a843]" }}
            >
              HOME
            </Link>
            <Link
              to="/profile"
              className="hover:text-[#d4a843] transition-colors"
              activeProps={{ className: "text-[#d4a843]" }}
            >
              PROFILE
            </Link>
            <Link
              to="/settings"
              className="hover:text-[#d4a843] transition-colors"
              activeProps={{ className: "text-[#d4a843]" }}
            >
              SETTINGS
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-sm border ${conn.connected ? "bg-[#2a5f3f]/10 border-[#2a5f3f]/30" : "bg-[#8b2335]/10 border-[#8b2335]/30"}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${conn.reconnecting ? "bg-[#e05060] animate-pulse" : conn.connected ? "bg-[#4cd183] animate-pulse" : "bg-[#9baab8]"}`}
              />
              <span
                className={`text-[10px] font-mono tracking-widest ${conn.connected ? "text-[#4cd183]" : "text-[#e05060]"}`}
              >
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
                className="px-4 py-2 text-[11px] font-mono uppercase tracking-widest border border-white/20 hover:border-[#d4a843] hover:text-[#d4a843] rounded-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}

      <div className="relative z-10">{children}</div>

      {!hideChrome && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-between p-4 pointer-events-none md:p-6">
          <div className="flex flex-col gap-1 pointer-events-auto">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
              System Status
            </span>
            {showLatency && (
              <span className="text-[11px] font-mono text-[#4cd183] uppercase">
                Server: AP-SOUTH ({conn.latencyMs ?? "—"}ms)
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
