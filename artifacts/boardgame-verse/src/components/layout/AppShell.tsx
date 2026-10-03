import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
        <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[#070910]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            <Link
              to="/"
              className="font-display text-2xl tracking-tight italic uppercase text-white"
            >
              GameHub
            </Link>
            <div className="hidden md:flex items-center gap-1 text-[12px] font-medium text-foreground/55">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                className="rounded-full px-3 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
                activeProps={{ className: "rounded-full px-3 py-1.5 bg-white/8 text-accent-cyan" }}
              >
                Home
              </Link>
              <Link
                to="/profile"
                className="rounded-full px-3 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
                activeProps={{ className: "rounded-full px-3 py-1.5 bg-white/8 text-accent-cyan" }}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="rounded-full px-3 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
                activeProps={{ className: "rounded-full px-3 py-1.5 bg-white/8 text-accent-cyan" }}
              >
                Settings
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${conn.reconnecting ? "bg-accent-amber" : conn.connected ? "bg-emerald-400" : "bg-white/30"}`}
                />
                <span className="text-[11px] font-medium text-white/70">
                  {conn.reconnecting ? "Reconnecting" : conn.connected ? "Online" : "Offline"}
                  {showLatency && conn.connected ? ` · ${conn.latencyMs ?? "—"}ms` : ""}
                </span>
              </div>
              {user ? (
                <button
                  onClick={() => router.navigate({ to: "/profile" })}
                  className="cursor-pointer rounded-full"
                  aria-label="Open profile"
                >
                  <Avatar name={user.username} color={user.avatarColor} size={36} ring />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12px] font-semibold tracking-wide hover:border-accent-cyan/50 hover:text-accent-cyan transition-colors"
                >
                  Sign in
                </Link>
              )}
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full border border-white/15 md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm hover:bg-white/5"
                activeOptions={{ exact: true }}
                activeProps={{ className: "rounded-xl px-3 py-2.5 text-sm text-accent-cyan bg-white/5" }}
              >
                Home
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm hover:bg-white/5"
                activeProps={{ className: "rounded-xl px-3 py-2.5 text-sm text-accent-cyan bg-white/5" }}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm hover:bg-white/5"
                activeProps={{ className: "rounded-xl px-3 py-2.5 text-sm text-accent-cyan bg-white/5" }}
              >
                Settings
              </Link>
            </div>
          )}
        </nav>
      )}

      <div className="relative z-10">{children}</div>

      {!hideChrome && (
        <footer className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-[12px] text-white/35">
          <span>Play with friends, or fill the table with AI.</span>
          <span className="hidden sm:inline">GameHub</span>
        </footer>
      )}
    </div>
  );
}
