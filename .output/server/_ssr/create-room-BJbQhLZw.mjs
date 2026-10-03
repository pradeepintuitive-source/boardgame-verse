import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { R as Route$4, u as useAuth } from "./router-CrXfqMs4.mjs";
import { a as useCreateRoom } from "./useRooms-LWPZnYcI.mjs";
import "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";

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
import "../_libs/lucide-react.mjs";
function CreateRoomPage() {
  const navigate = useNavigate();
  const search = Route$4.useSearch();
  const auth = useAuth();
  const createRoomMutation = useCreateRoom();
  const [name, setName] = reactExports.useState("My Game Room");
  const [gameType, setGameType] = reactExports.useState(search.game ?? "mafia");
  const [maxPlayers, setMax] = reactExports.useState(3);
  const [ai, setAi] = reactExports.useState(0);
  const [isPrivate, setPrivate] = reactExports.useState(false);
  const [isLan, setLan] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked and working...asd and working fine");
    setLoading(true);
    try {
      if (!auth.user) {
        const guest = `Host${Math.floor(Math.random() * 9999)}`;
        await auth.loginGuest(guest);
      }
      console.log("Before mutate");
      const room = await createRoomMutation.mutateAsync({
        name,
        gameType,
        maxPlayers,
        aiPlayerCount: ai,
        isPrivate,
        isLan
      });
      console.log("After mutate", room);
      console.log("Navigating to lobby", room.id, room.code);
      navigate({
        to: "/lobby/$roomId",
        params: {
          roomId: room.id
        }
      });
    } catch (error) {
      console.error("Create room failed", error);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/60 ml-2", children: "debug instrumentation active" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl italic uppercase mb-8", children: "Create Room" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "glass-panel p-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Room Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none", required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Game Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-2 gap-3", children: ["mafia", "monopoly"].map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setGameType(g), className: `p-4 border font-display text-2xl italic uppercase transition-all cursor-pointer ${gameType === g ? "border-accent-cyan text-accent-cyan shadow-[var(--shadow-neon-cyan)]" : "border-white/10 text-white/60 hover:border-white/40"}`, children: g }, g)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Max Players" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 3, max: 16, value: maxPlayers, onChange: (e) => setMax(Number(e.target.value)), className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "AI Players" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, max: maxPlayers - 1, value: ai, onChange: (e) => setAi(Number(e.target.value)), className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-3 border border-white/10 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: isPrivate, onChange: (e) => setPrivate(e.target.checked), className: "accent-[var(--accent-cyan)] size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono uppercase tracking-widest", children: "Private" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-3 border border-white/10 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: isLan, onChange: (e) => setLan(e.target.checked), className: "accent-[var(--accent-cyan)] size-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono uppercase tracking-widest", children: "LAN Mode" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { type: "submit", disabled: loading, className: "flex-1", children: loading ? "Creating..." : "Create Room" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { type: "button", variant: "ghost", onClick: () => navigate({
          to: "/"
        }), children: "Cancel" })
      ] })
    ] })
  ] }) });
}
export {
  CreateRoomPage as component
};
