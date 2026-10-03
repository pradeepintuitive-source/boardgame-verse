import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useSettingsStore, A as AppShell } from "./AppShell-DseihURL.mjs";
import "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";

import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/lucide-react.mjs";
function SettingsPage() {
  const s = useSettingsStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2", children: "System" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl italic uppercase mb-8", children: "Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      [{
        key: "sfxVolume",
        label: "SFX Volume",
        type: "range"
      }, {
        key: "musicVolume",
        label: "Music Volume",
        type: "range"
      }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel p-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono uppercase tracking-widest text-white/70", children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: s[f.key], onChange: (e) => s.set(f.key, Number(e.target.value)), className: "w-40 accent-[var(--accent-cyan)]" })
      ] }, f.key)),
      [{
        key: "reducedMotion",
        label: "Reduced Motion"
      }, {
        key: "showLatency",
        label: "Show Server Latency"
      }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "glass-panel p-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono uppercase tracking-widest text-white/70", children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: s[f.key], onChange: (e) => s.set(f.key, e.target.checked), className: "size-5 accent-[var(--accent-cyan)]" })
      ] }, f.key))
    ] })
  ] }) });
}
export {
  SettingsPage as component
};
