import { resolve } from "node:path";
import process from "node:process";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const registry = resolve(import.meta.dirname, "../../registry/shell");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Watch the registry directory so HMR survives atomic saves outside the Vite root.
      name: "watch-registry",
      configureServer(server) {
        server.watcher.add(registry);
      },
    },
  ],
  resolve: {
    // `@/shell` mirrors where `shadcn add` places the registry files in a host app.
    alias: [
      { find: /^@\/shell\//, replacement: `${registry}/` },
      { find: /^@\//, replacement: `${resolve(import.meta.dirname, "src")}/` },
    ],
  },
  // GitHub Pages serves the demo under /appshell/demo/.
  base: process.env.SHELL_WEB_BASE ?? "/",
  server: { host: "0.0.0.0", allowedHosts: true },
});
