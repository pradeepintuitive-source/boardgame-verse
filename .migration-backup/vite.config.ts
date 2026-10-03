import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    server: {
      proxy: {
        "/api": {
          target: "https://api.pradeepkulal.click",
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("origin", "https://boardgame-verse.vercel.app");
              proxyReq.setHeader("referer", "https://boardgame-verse.vercel.app/");
            });
          },
        },
        "/ws": {
          target: "https://api.pradeepkulal.click",
          changeOrigin: true,
          ws: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("origin", "https://boardgame-verse.vercel.app");
              proxyReq.setHeader("referer", "https://boardgame-verse.vercel.app/");
            });
            proxy.on("proxyReqWs", (proxyReq) => {
              proxyReq.setHeader("origin", "https://boardgame-verse.vercel.app");
              proxyReq.setHeader("referer", "https://boardgame-verse.vercel.app/");
            });
          },
        },
      },
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});