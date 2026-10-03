import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { u as useAuth, a as apiErrorMessage } from "./router-CrXfqMs4.mjs";
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
function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    loginGuest
  } = useAuth();
  const [username, setU] = reactExports.useState("");
  const [password, setP] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(username.trim(), password);
      navigate({
        to: "/"
      });
    } catch (err) {
      setErrorMessage(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  const guest = async () => {
    const name = username.trim() || `Guest${Math.floor(Math.random() * 9999)}`;
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginGuest(name);
      navigate({
        to: "/"
      });
    } catch (err) {
      setErrorMessage(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "w-full max-w-md glass-panel p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-2", children: "Authenticate" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl italic uppercase mb-8", children: "Sign In" }),
    errorMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive font-mono", children: errorMessage }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Username or Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: username, onChange: (e) => setU(e.target.value), className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono", autoFocus: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setP(e.target.value), className: "mt-1 w-full bg-background border border-white/10 px-3 py-3 focus:border-accent-cyan outline-none font-mono" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { type: "submit", disabled: loading, className: "w-full mb-3", children: loading ? "Connecting..." : "Sign In" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { type: "button", variant: "ghost", onClick: guest, className: "w-full", children: "Play as Guest" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-xs font-mono text-white/40 text-center", children: [
      "New player?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "text-accent-cyan hover:underline", children: "Create an account" })
    ] })
  ] }) }) });
}
export {
  LoginPage as component
};
