import { c as api } from "./router-CrXfqMs4.mjs";
import "../_libs/react.mjs";
import "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
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
const gamesApi = {
  snapshot: async (gameId) => {
    const { data } = await api.get(`games/${gameId}`);
    return data;
  },
  log: async (gameId) => {
    const { data } = await api.get(`games/${gameId}/log`);
    return data;
  },
  pause: async (gameId) => {
    await api.post(`games/${gameId}/pause`);
  },
  resume: async (gameId) => {
    await api.post(`games/${gameId}/resume`);
  },
  end: async (gameId) => {
    await api.post(`games/${gameId}/end`);
  }
};
export {
  gamesApi
};
