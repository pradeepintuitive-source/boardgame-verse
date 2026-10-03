import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell, a as Avatar } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { b as useAuthStore } from "./router-CrXfqMs4.mjs";
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
function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    updateProfile,
    logout
  } = useAuthStore();
  const [name, setName] = reactExports.useState(user?.username ?? "");
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6", children: "You're not signed in." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => navigate({
        to: "/login"
      }), children: "Sign In" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2", children: "Operator" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl italic uppercase mb-8", children: "Profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel p-6 flex items-center gap-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { name: user.username, color: user.avatarColor, size: 80, ring: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-3xl italic uppercase truncate", children: user.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-white/40 uppercase", children: user.isGuest ? "Guest Account" : user.email ?? "Registered" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block mb-6 glass-panel p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Display Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "mt-2 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "sm", onClick: () => updateProfile({
        username: name.trim() || user.username
      }), children: "Save" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "ghost", onClick: () => {
      logout();
      navigate({
        to: "/"
      });
    }, children: "Sign Out" })
  ] }) });
}
export {
  ProfilePage as component
};
