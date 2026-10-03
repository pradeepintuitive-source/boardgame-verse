import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { u as useAuth } from "./router-CrXfqMs4.mjs";
import { u as useLobbyStore } from "./lobbyStore-BdjC3eqw.mjs";
import { u as useJoinRoomByCode } from "./useRooms-LWPZnYcI.mjs";
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
function JoinRoomPage() {
  const navigate = useNavigate();
  const {
    user,
    loginGuest
  } = useAuth();
  const joinByCode = useJoinRoomByCode();
  const upsertRoom = useLobbyStore((s) => s.upsertRoom);
  const [code, setCode] = reactExports.useState("");
  const [name, setName] = reactExports.useState(user?.username ?? "");
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      if (!user) {
        const guest = name.trim() || `Guest${Math.floor(Math.random() * 9999)}`;
        await loginGuest(guest);
      }
      const room = await joinByCode.mutateAsync(code.trim());
      upsertRoom(room);
      if (room.gameType === "monopoly" && room.state && ["IN_PROGRESS", "PAUSED"].includes(room.state.toUpperCase()) && room.currentSessionId) {
        navigate({
          to: "/monopoly/$gameId",
          params: {
            gameId: room.currentSessionId
          }
        });
      } else {
        navigate({
          to: "/lobby/$roomId",
          params: {
            roomId: room.id
          }
        });
      }
    } catch {
      setErrorMessage("Unable to join this room. Please verify the code and try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "w-full max-w-md glass-panel p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-pink mb-2", children: "Join Lobby" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl italic uppercase mb-8", children: "Enter Code" }),
    !user && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Your Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 font-mono focus:border-accent-cyan outline-none" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Room Code" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), maxLength: 6, className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 font-display text-3xl tracking-[0.5em] text-center focus:border-accent-cyan outline-none uppercase", autoFocus: true, required: true })
    ] }),
    errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive text-xs font-mono mb-3", children: errorMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { type: "submit", disabled: loading, className: "w-full mt-6", children: loading ? "Joining..." : "Join Game" })
  ] }) }) });
}
export {
  JoinRoomPage as component
};
