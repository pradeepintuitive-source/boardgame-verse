import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell, a as Avatar } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { C as ChatDrawer } from "./ChatDrawer-Bg0ZO6e8.mjs";
import { u as useGameStore, r as resolveNight, b as beginVoting, a as resolveVoting, c as castVote } from "./mafiaEngine-DkPOJlLR.mjs";
import { g as Route$1, b as useAuthStore } from "./router-CrXfqMs4.mjs";
import "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { n as Moon, o as Sun, b as Trophy, p as Shield, q as Heart, E as Eye, r as Skull, G as Gavel, d as Bot } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/zustand.mjs";
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

import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const ROLE_META = {
  mafia: {
    icon: Skull,
    label: "Mafia",
    tagline: "Eliminate the town. Win at any cost.",
    color: "#ff00e5"
  },
  detective: {
    icon: Eye,
    label: "Detective",
    tagline: "Each night, investigate one player.",
    color: "#00f2ff"
  },
  doctor: { icon: Heart, label: "Doctor", tagline: "Each night, save one soul.", color: "#4ade80" },
  villager: {
    icon: Shield,
    label: "Villager",
    tagline: "Find the Mafia. Vote them out.",
    color: "#facc15"
  }
};
function RoleCard({ role }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.92, rotateY: -20 },
      animate: { opacity: 1, scale: 1, rotateY: 0 },
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
      className: "relative glass-panel p-8 border-2 max-w-sm",
      style: { borderColor: `${meta.color}80`, boxShadow: `0 0 40px ${meta.color}40` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 mb-2", children: "Your Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-12", style: { color: meta.color } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "font-display text-5xl uppercase italic",
              style: { color: meta.color, textShadow: `0 0 18px ${meta.color}` },
              children: meta.label
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-sm leading-relaxed", children: meta.tagline }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none scanlines opacity-10" })
      ]
    }
  );
}
function PlayerSeat({ player, isMe, selectable, selected, onSelect, voteCount }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      layout: true,
      whileHover: selectable ? { y: -4 } : {},
      whileTap: selectable ? { scale: 0.97 } : {},
      disabled: !selectable,
      onClick: onSelect,
      className: `relative flex items-center gap-3 p-3 glass-panel border text-left transition-all w-full
        ${player.alive ? "border-white/10" : "border-destructive/30 grayscale opacity-50"}
        ${selectable ? "cursor-pointer hover:border-accent-cyan/60" : ""}
        ${selected ? "border-accent-cyan ring-2 ring-accent-cyan/50" : ""}
      `,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name: player.username, color: player.avatarColor, size: 40 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm truncate text-white", children: player.username }),
            isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono uppercase text-accent-cyan border border-accent-cyan/40 px-1", children: "YOU" }),
            player.isAI && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono uppercase text-white/40 border border-white/20 px-1", children: "AI" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase text-white/40", children: player.alive ? "ALIVE" : `DEAD · ${player.role.toUpperCase()}` })
        ] }),
        voteCount != null && voteCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1 bg-accent-pink/20 border border-accent-pink/40 text-accent-pink font-mono text-xs", children: voteCount }),
        !player.alive && /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { className: "size-5 text-destructive/70" })
      ]
    }
  );
}
const ROLE_PROMPT = {
  mafia: "Choose a citizen to eliminate.",
  detective: "Choose a player to investigate.",
  doctor: "Choose a player to protect.",
  villager: "Sleep. The night belongs to others."
};
function NightActionPanel({ me, players, selectedTargetId, onSelect, onConfirm }) {
  const canAct = me.alive && me.role !== "villager";
  const targets = players.filter((p) => p.alive && p.id !== me.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-pink/20 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-4 text-accent-pink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-pink", children: "Night Action" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/70 mb-4 italic", children: ROLE_PROMPT[me.role] }),
    canAct ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4", children: targets.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        PlayerSeat,
        {
          player: p,
          selectable: true,
          selected: selectedTargetId === p.id,
          onSelect: () => onSelect(p.id)
        },
        p.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NeonButton,
        {
          variant: "pink",
          size: "md",
          disabled: !selectedTargetId,
          onClick: onConfirm,
          className: "w-full",
          children: "Confirm Action"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "ghost", size: "md", onClick: onConfirm, className: "w-full", children: "Skip to morning" })
  ] });
}
function VotingPanel({ me, players, onVote, onResolve }) {
  const tally = {};
  players.forEach((p) => {
    if (p.alive && p.votedFor) tally[p.votedFor] = (tally[p.votedFor] ?? 0) + 1;
  });
  const alive = players.filter((p) => p.alive);
  const canVote = me.alive && !me.votedFor;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-cyan/30 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "size-4 text-accent-cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan", children: "Voting · Day Phase" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4", children: alive.filter((p) => p.id !== me.id).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlayerSeat,
      {
        player: p,
        selectable: canVote,
        selected: me.votedFor === p.id,
        onSelect: () => onVote(p.id),
        voteCount: tally[p.id] ?? 0
      },
      p.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "cyan", size: "md", onClick: onResolve, className: "w-full", children: "Tally Votes" })
  ] });
}
function Typewriter({ text }) {
  const [shown, setShown] = reactExports.useState("");
  reactExports.useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
    shown,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-4 ml-0.5 bg-accent-cyan align-middle animate-[typewriter-blink_1s_steps(2)_infinite]" })
  ] });
}
function ModeratorPanel({ log }) {
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log.length]);
  const latest = log[log.length - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-cyan/30 p-5 flex flex-col gap-3 max-h-[420px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pb-2 border-b border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "size-4 text-accent-cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan", children: "AI Moderator" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-[9px] font-mono text-white/40", children: [
        log.length,
        " EVENTS"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto pr-2 space-y-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: log.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4 },
        className: m.kind === "announcement" ? "text-white font-medium" : m.kind === "rule" ? "text-accent-cyan/80 italic" : m.kind === "system" ? "text-accent-amber/70 font-mono text-xs" : "text-white/70",
        children: i === log.length - 1 && m === latest ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typewriter, { text: m.text }) : m.text
      },
      m.id
    )) }) })
  ] });
}
function MafiaPage() {
  const {
    gameId
  } = Route$1.useParams();
  const navigate = useNavigate();
  const state = useGameStore((s) => s.mafia[gameId]);
  const patch = useGameStore((s) => s.patchMafia);
  const setMafia = useGameStore((s) => s.setMafia);
  const user = useAuthStore((s) => s.user);
  const [target, setTarget] = reactExports.useState(null);
  const [showRole, setShowRole] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setShowRole(false), 4200);
    return () => clearTimeout(t);
  }, [gameId]);
  const me = reactExports.useMemo(() => state?.players.find((p) => p.id === user?.id) ?? state?.players[0], [state, user]);
  if (!state || !me) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6 font-mono", children: "This match has ended or was lost." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => navigate({
        to: "/"
      }), children: "Back Home" })
    ] }) }) });
  }
  const isNight = state.phase === "night";
  const isVoting = state.phase === "voting";
  const isDay = state.phase === "day";
  const isEnded = state.phase === "ended";
  const confirmNight = () => {
    const actions = {
      ...state.nightActions
    };
    if (me.role !== "villager" && target) actions[me.id] = target;
    const next = resolveNight({
      ...state,
      nightActions: actions
    });
    setMafia(gameId, next);
    setTarget(null);
  };
  const beginVote = () => setMafia(gameId, beginVoting(state));
  const vote = (id) => patch(gameId, castVote(state, me.id, id));
  const resolveVote = () => setMafia(gameId, resolveVoting(state));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { hideChrome: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "fixed inset-0 -z-10 transition-colors duration-1000", style: {
      background: isNight ? "radial-gradient(circle at 50% 0%, #1a0633 0%, #050507 60%)" : isVoting || isDay ? "radial-gradient(circle at 50% 0%, #0a1f2e 0%, #050507 60%)" : "var(--gradient-radial-glow)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      y: -40,
      scale: 0.8
    }, animate: {
      opacity: 0.6,
      y: 0,
      scale: 1
    }, transition: {
      duration: 1.4,
      ease: [0.19, 1, 0.22, 1]
    }, className: "fixed top-12 right-12 pointer-events-none", children: isNight ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-32 text-accent-pink drop-shadow-[0_0_40px_rgba(255,0,229,0.6)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-32 text-accent-cyan drop-shadow-[0_0_40px_rgba(0,242,255,0.6)]" }) }, state.phase),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showRole && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, exit: {
      opacity: 0
    }, transition: {
      duration: 0.5
    }, className: "fixed inset-0 z-50 bg-background/95 backdrop-blur-md grid place-items-center px-6", onClick: () => setShowRole(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RoleCard, { role: me.role }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-[10px] font-mono uppercase tracking-[0.4em] text-white/40", children: "Tap anywhere to continue" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative px-6 pt-10 pb-32 max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-1", children: [
            "Round ",
            state.round,
            " · ",
            state.phase
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl md:text-7xl italic uppercase neon-text-glow", children: isNight ? "Night Falls" : isVoting ? "Cast Your Vote" : isDay ? "Daybreak" : "Match Over" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowRole(true), className: "px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-white/20 hover:border-accent-cyan", children: "View My Role" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3", children: [
              "Players · ",
              state.players.filter((p) => p.alive).length,
              " alive"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2", children: state.players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerSeat, { player: p, isMe: p.id === me.id }, p.id)) })
          ] }),
          isNight && /* @__PURE__ */ jsxRuntimeExports.jsx(NightActionPanel, { me, players: state.players, selectedTargetId: target, onSelect: setTarget, onConfirm: confirmNight }),
          isDay && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-cyan/20 p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 mb-4", children: "Discuss. Suspect. When the town is ready, begin the vote." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "cyan", onClick: beginVote, children: "Begin Voting" })
          ] }),
          isVoting && /* @__PURE__ */ jsxRuntimeExports.jsx(VotingPanel, { me, players: state.players, onVote: vote, onResolve: resolveVote }),
          isEnded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-amber/40 p-8 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-12 text-accent-amber mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-amber mb-2", children: state.winner === "mafia" ? "Mafia Victory" : "Villager Victory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-4xl italic uppercase mb-6", children: state.winner === "mafia" ? "The town has fallen." : "Justice prevails." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => navigate({
              to: "/"
            }), children: "Return to Lobby" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ModeratorPanel, { log: state.log }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChatDrawer, { roomId: gameId })
  ] });
}
export {
  MafiaPage as component
};
