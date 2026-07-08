import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      target: "cloudflare-module",
      customViteReactPlugin: true,
    }),
    (await import("@vitejs/plugin-react")).default(),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
