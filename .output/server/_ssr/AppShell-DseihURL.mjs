import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useAuthStore, e as useConnectionStore, j as initials } from "./router-CrXfqMs4.mjs";
import { c as create, p as persist } from "../_libs/zustand.mjs";
function Avatar({
  name,
  color,
  size = 32,
  ring = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `shrink-0 grid place-items-center rounded-full font-bold ${ring ? "ring-2 ring-offset-2 ring-offset-background" : ""}`,
      style: {
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}80)`,
        color: "#050507",
        fontSize: size * 0.34,
        boxShadow: ring ? `0 0 12px ${color}80` : void 0
      },
      "aria-label": name,
      children: initials(name)
    }
  );
}
function ParticleField({ count = 14 }) {
  const particles = reactExports.useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i,
      left: (i * 37 + 11) % 100 + i % 5 * 0.13,
      top: 60 + (i * 19 + 7) % 40,
      delay: i * 23 % 80 / 10,
      duration: 8 + i * 17 % 100 / 10,
      color: i % 3 === 0 ? "bg-accent-pink" : "bg-accent-cyan"
    })),
    [count]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", children: particles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `absolute h-1 w-1 rounded-full ${p.color} opacity-50`,
      style: {
        left: `${p.left}%`,
        top: `${p.top}%`,
        animation: `float-particle ${p.duration}s linear infinite`,
        animationDelay: `${p.delay}s`
      }
    },
    p.id
  )) });
}
const useSettingsStore = create()(
  persist(
    (set) => ({
      sfxVolume: 0.7,
      musicVolume: 0.4,
      reducedMotion: false,
      showLatency: true,
      set: (k, v) => set({ [k]: v })
    }),
    { name: "gamehub.settings" }
  )
);
function AppShell({
  children,
  hideChrome = false
}) {
  const user = useAuthStore((s) => s.user);
  const conn = useConnectionStore();
  const showLatency = useSettingsStore((s) => s.showLatency);
  const router = useRouter();
  reactExports.useEffect(() => {
    conn.init();
  }, [conn]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full bg-background text-foreground overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "aria-hidden": true,
        className: "pointer-events-none fixed inset-0",
        style: { background: "var(--gradient-radial-glow)" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ParticleField, {}),
    !hideChrome && /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "font-display text-2xl tracking-tighter italic uppercase neon-text-glow text-white",
          children: "GameHub"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex gap-8 text-[11px] font-mono tracking-widest text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/",
            activeOptions: { exact: true },
            className: "hover:text-accent-cyan transition-colors",
            activeProps: { className: "text-accent-cyan" },
            children: "HOME"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/profile",
            className: "hover:text-accent-cyan transition-colors",
            activeProps: { className: "text-accent-cyan" },
            children: "PROFILE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/settings",
            className: "hover:text-accent-cyan transition-colors",
            activeProps: { className: "text-accent-cyan" },
            children: "SETTINGS"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `w-1.5 h-1.5 rounded-full ${conn.reconnecting ? "bg-accent-amber animate-pulse" : "bg-accent-cyan animate-pulse"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-accent-cyan tracking-widest", children: conn.reconnecting ? "RECONNECTING" : conn.connected ? "ONLINE" : "OFFLINE MODE" })
        ] }),
        user ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => router.navigate({ to: "/profile" }),
            className: "cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name: user.username, color: user.avatarColor, size: 36, ring: true })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: "px-4 py-2 text-[11px] font-mono uppercase tracking-widest border border-white/20 hover:border-accent-cyan hover:text-accent-cyan transition-colors",
            children: "Sign In"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10", children }),
    !hideChrome && /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "fixed bottom-0 left-0 right-0 z-40 p-6 flex justify-between items-end pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 pointer-events-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]", children: "System Status" }),
        showLatency && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-mono text-accent-cyan uppercase", children: [
          "Server: EU-WEST (",
          conn.latencyMs ?? "—",
          "ms)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto hidden md:flex items-center gap-3 text-[10px] font-mono text-white/40 tracking-widest", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "v1.0.0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "GAMEHUB" })
      ] })
    ] })
  ] });
}
export {
  AppShell as A,
  Avatar as a,
  useSettingsStore as u
};
