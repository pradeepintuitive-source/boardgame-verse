import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { U as Users, C as Clock } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./router-CrXfqMs4.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";





import "../_libs/combined-stream.mjs";

import "../_libs/delayed-stream.mjs";

import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";



import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "../_libs/supports-color.mjs";

import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";


import "../_libs/follow-redirects.mjs";

import "../_libs/zustand.mjs";
import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function GameCard({
  title,
  description,
  players,
  duration,
  image,
  accent,
  offset,
  to,
  badge
}) {
  const glow = accent === "cyan" ? "bg-accent-cyan" : "bg-accent-pink";
  const titleHover = accent === "cyan" ? "group-hover:text-accent-cyan" : "group-hover:text-accent-pink";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      whileHover: { y: -12 },
      transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
      className: `group relative w-full max-w-[400px] ${offset ? "md:translate-y-12" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `absolute -inset-1 ${glow} opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 pointer-events-none`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] glass-panel border border-white/10 p-6 flex flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full aspect-[4/3] mb-6 overflow-hidden bg-neutral-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: image,
                alt: `${title} key art`,
                loading: "lazy",
                width: 800,
                height: 600,
                className: "h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
              }
            ),
            badge && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `absolute top-3 left-3 px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${accent === "cyan" ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40" : "bg-accent-pink/20 text-accent-pink border border-accent-pink/40"}`,
                children: badge
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `font-display text-4xl uppercase italic transition-colors ${titleHover}`, children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] border border-white/20 px-2 py-1 inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3" }),
              " ",
              players
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm leading-relaxed mb-6 flex-grow", children: description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] text-white/40 inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" }),
              " ",
              duration
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: accent, size: "sm", children: "Play Now" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none scanlines opacity-10" })
        ] })
      ]
    }
  );
}
const pageFade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } }
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};
const riseItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } }
};
const mafiaArt = "/assets/mafia-art-CkKHvIeD.jpg";
const monopolyArt = "/assets/monopoly-art-TmOOsyH4.jpg";
function Index() {
  const [resumeSession, setResumeSession] = reactExports.useState(null);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem("gamehub:resume-session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.sessionId) {
          setResumeSession(parsed);
        }
      }
    } catch {
      setResumeSession(null);
    }
  }, []);
  const resumeLabel = reactExports.useMemo(() => {
    if (!resumeSession) return null;
    return resumeSession.gameType === "monopoly" ? "Resume Monopoly" : "Resume Game";
  }, [resumeSession]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative flex flex-col items-center pt-32 pb-32 px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { variants: pageFade, initial: "hidden", animate: "show", className: "text-center mb-20 md:mb-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.h1, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, transition: {
        duration: 1,
        delay: 0.1
      }, className: "font-display text-7xl md:text-9xl tracking-tighter italic text-white neon-text-glow leading-none mb-4 uppercase", style: {
        animation: "flicker 3s ease-out both"
      }, children: "GameHub" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-accent-cyan/60 font-mono text-xs md:text-sm tracking-[0.4em] uppercase mb-12", children: "Digital Classics Pradeep • Premium Board Gaming" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 justify-center", children: [
        resumeSession && resumeLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/monopoly/$gameId", params: {
          gameId: resumeSession.sessionId
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "lg", children: resumeLabel }) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/create-room", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "lg", children: "Create Room" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/join-room", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "ghost", size: "lg", children: "Join Game" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: stagger, initial: "hidden", animate: "show", className: "flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-6xl items-center md:items-start justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: riseItem, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GameCard, { title: "Mafia", description: "The original social deduction game. Find the imposters before they take over the city. Trust no one.", players: "6-12", duration: "EST. 45 MIN", image: mafiaArt, accent: "pink", badge: "Available", to: "/create-room?game=mafia" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: riseItem, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GameCard, { title: "Monopoly: India Edition", description: "The ultimate property trading game. Build your Bharat empire with Indian cities, ₹ currency, and a modern India-themed board.", players: "2-6", duration: "EST. 90 MIN", image: monopolyArt, accent: "cyan", badge: "Available", offset: true, to: "/create-room?game=monopoly" }) })
    ] })
  ] }) });
}
export {
  Index as component
};
