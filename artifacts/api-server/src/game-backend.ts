import { createProxyMiddleware } from "http-proxy-middleware";
import { logger } from "./lib/logger";

// Preserve the imported Spring backend and its existing origin allowlist.
// This is transport only: authentication, room state and game rules stay upstream.
export const gameBackend = createProxyMiddleware({
  target: "https://api.pradeepkulal.click",
  changeOrigin: true,
  ws: true,
  proxyTimeout: 15000,
  on: {
    proxyReq(proxyReq) {
      proxyReq.setHeader("origin", "https://boardgame-verse.vercel.app");
      proxyReq.setHeader("referer", "https://boardgame-verse.vercel.app/");
    },
    proxyReqWs(proxyReq) {
      proxyReq.setHeader("origin", "https://boardgame-verse.vercel.app");
      proxyReq.setHeader("referer", "https://boardgame-verse.vercel.app/");
    },
    error(err, _req, res) {
      logger.error({ err }, "Game backend unavailable");
      if ("writeHead" in res && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "The game server is unavailable. Please try again later." }));
      }
    },
  },
});