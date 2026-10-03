import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { A as AppShell, a as Avatar } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { u as useStompSubscription, C as ChatDrawer } from "./ChatDrawer-Bg0ZO6e8.mjs";
import { u as useLobbyStore } from "./lobbyStore-BdjC3eqw.mjs";
import { h as Route, b as useAuthStore, e as useConnectionStore, f as useWebsocketRequestStore, T as Topics, s as stomp } from "./router-CrXfqMs4.mjs";
import { u as useGameStore, i as initMafiaGame } from "./mafiaEngine-DkPOJlLR.mjs";
import { b as useRoom, e as useStartGame, c as useLeaveRoom } from "./useRooms-LWPZnYcI.mjs";
import "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";
import { W as Wifi, L as Lock, s as Copy, t as Crown, d as Bot, X, u as UserPlus, v as LogOut } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
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
function LobbyPage() {
  const {
    roomId
  } = Route.useParams();
  const navigate = useNavigate();
  const {
    addAI,
    removePlayer
  } = useLobbyStore();
  const user = useAuthStore((s) => s.user);
  const setMafia = useGameStore((s) => s.setMafia);
  const wsConnected = useConnectionStore((s) => s.connected);
  const roomQuery = useRoom(roomId);
  const qc = useQueryClient();
  const startGameMut = useStartGame();
  const leaveMut = useLeaveRoom();
  useStompSubscription(roomId ? Topics.room(roomId) : null, () => {
    useWebsocketRequestStore.getState().completeAllRequests();
    qc.invalidateQueries({
      queryKey: ["room", roomId]
    });
    qc.invalidateQueries({
      queryKey: ["rooms"]
    });
  }, !!roomId);
  useStompSubscription(roomId ? Topics.gameRoom(roomId) : null, (msg) => {
    try {
      if (!msg || msg.type !== "GAME_STARTED") return;
      const sessionId = msg.sessionId;
      if (sessionId) {
        navigate({
          to: "/monopoly/$gameId",
          params: {
            gameId: sessionId
          }
        });
      }
    } catch (e) {
      console.error("Failed handling GAME_STARTED message", e);
    }
  }, !!roomId);
  reactExports.useEffect(() => {
    if (!roomQuery.data || roomQuery.data.gameType !== "monopoly") return;
    const room2 = roomQuery.data;
    if (["IN_PROGRESS", "PAUSED"].includes(room2.state.toUpperCase()) && room2.currentSessionId) {
      navigate({
        to: "/monopoly/$gameId",
        params: {
          gameId: room2.currentSessionId
        }
      });
    }
  }, [roomQuery.data, navigate]);
  reactExports.useEffect(() => {
    if (wsConnected || !roomId) return;
    const t = setInterval(() => {
      qc.invalidateQueries({
        queryKey: ["room", roomId]
      });
    }, 3e3);
    return () => clearInterval(t);
  }, [wsConnected, roomId, qc]);
  const room = roomQuery.data;
  const [copied, setCopied] = reactExports.useState(false);
  const pendingRequests = useWebsocketRequestStore((s) => s.pendingRequests);
  const pendingReady = pendingRequests.some((req) => req.action === "READY");
  if (!room) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6 font-mono", children: roomQuery.isLoading ? "Loading room…" : "This room no longer exists." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => navigate({
        to: "/"
      }), children: "Back Home" })
    ] }) }) });
  }
  const isHost = user?.id === room.hostId;
  const minPlayers = room.gameType === "monopoly" ? 2 : 3;
  const allReady = room.players.every((p) => p.ready) && room.players.length >= minPlayers;
  const copy = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const start = async () => {
    if (room.gameType === "mafia") {
      const gameId = room.id;
      setMafia(gameId, initMafiaGame(gameId, room.players));
      navigate({
        to: "/mafia/$gameId",
        params: {
          gameId
        }
      });
      return;
    }
    if (room.gameType === "monopoly") {
      try {
        const response = await startGameMut.mutateAsync(room.id);
        const sessionId = response.sessionId;
        const maxAttempts = 6;
        let ok = false;
        for (let i = 0; i < maxAttempts; i++) {
          try {
            await import("./games-J_Q9zvha.mjs").then((m) => m.gamesApi.snapshot(sessionId));
            ok = true;
            break;
          } catch (e) {
            await new Promise((r) => setTimeout(r, 300));
          }
        }
        if (!ok) {
          console.warn("Snapshot not ready after start; navigating anyway");
        }
        navigate({
          to: "/monopoly/$gameId",
          params: {
            gameId: sessionId
          }
        });
      } catch (error) {
        console.error("Failed to start Monopoly game", error);
      }
    }
  };
  const me = room.players.find((p) => p.userId === user?.id);
  const myReady = !!me?.ready;
  const handleToggleReady = () => {
    if (!me) return;
    const dest = Topics.send.roomReady(room.id);
    const {
      sent,
      requestId
    } = stomp.sendTrackedMessage(dest, {
      ready: !myReady
    }, "READY", {
      roomId: room.id
    });
    if (!sent) {
      console.warn("[lobby] STOMP ready toggle failed", dest, {
        requestId,
        ready: !myReady
      });
    }
  };
  const handleLeave = () => {
    leaveMut.mutate(room.id, {
      onSettled: () => navigate({
        to: "/"
      })
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-6 pt-28 pb-32 max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-1", children: [
            "Lobby · ",
            room.gameType
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl md:text-6xl italic uppercase truncate", children: room.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "size-3" }),
              " ",
              room.isLan ? "LAN" : "Online"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1.5", children: room.isPrivate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3" }),
              " Private"
            ] }) : "Public" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              room.players.length,
              "/",
              room.maxPlayers,
              " Seats"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copy, className: "glass-panel border border-accent-cyan/30 px-4 py-3 hover:border-accent-cyan transition-colors text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-mono uppercase tracking-[0.3em] text-white/40", children: "Room Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-2xl tracking-[0.3em] text-accent-cyan inline-flex items-center gap-2", children: [
            room.code,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-mono text-accent-cyan/60 h-3", children: copied ? "COPIED" : " " })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_320px] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3", children: [
            "Connected Players (",
            room.players.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: room.players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, initial: {
              opacity: 0,
              scale: 0.9
            }, animate: {
              opacity: 1,
              scale: 1
            }, exit: {
              opacity: 0,
              scale: 0.9
            }, className: `glass-panel border p-4 flex items-center gap-3 ${p.ready ? "border-accent-cyan/40" : "border-white/10"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name: p.username, color: p.avatarColor, size: 44 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold truncate", children: p.username }),
                  p.isHost && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5 text-accent-amber" }),
                  p.isAI && /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "size-3.5 text-accent-cyan" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] font-mono uppercase tracking-widest ${p.ready ? "text-accent-cyan" : "text-white/40"}`, children: p.ready ? "READY" : "WAITING" })
              ] }),
              isHost && !p.isHost && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removePlayer(room.id, p.id), className: "size-7 grid place-items-center hover:text-destructive transition-colors", "aria-label": "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) }),
              p.userId === user?.id && !p.isAI && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleReady, disabled: pendingReady, className: `text-[10px] font-mono uppercase tracking-widest px-2 py-1 border transition-colors disabled:opacity-60 ${p.ready ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10" : "border-white/20 hover:border-accent-cyan"}`, children: pendingReady ? "Pending…" : p.ready ? "Not Ready" : "Ready" })
            ] }, p.id)) }),
            room.players.length < room.maxPlayers && Array.from({
              length: room.maxPlayers - room.players.length
            }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-dashed border-white/10 p-4 grid place-items-center text-[10px] font-mono uppercase tracking-widest text-white/30", children: "Open Seat" }, `empty-${i}`))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-4", children: [
          isHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-3", children: "Host Controls" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { variant: "ghost", size: "sm", onClick: () => addAI(room.id), disabled: room.players.length >= room.maxPlayers, className: "w-full mb-3 inline-flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-3.5" }),
              " Add AI Player"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "md", disabled: !allReady, onClick: start, className: "w-full", children: allReady ? "Start Match" : `Need ${Math.max(0, minPlayers - room.players.length)} more` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { variant: "ghost", size: "sm", onClick: handleLeave, disabled: leaveMut.isPending, className: "w-full inline-flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-3.5" }),
            isHost ? "Close & Leave Room" : "Leave Room"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-panel p-5 text-xs font-mono text-white/50 leading-relaxed", children: "Share the room code with friends, or fill seats with AI players. The host starts the match when everyone is ready. You can rejoin any room later from Join Game using the room code." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChatDrawer, { roomId: room.id })
  ] });
}
export {
  LobbyPage as component
};
