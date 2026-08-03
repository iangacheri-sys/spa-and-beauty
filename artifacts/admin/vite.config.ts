import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// PORT and BASE_PATH are required for the dev server but default gracefully
// so that production builds (e.g. on Vercel) don't fail during `vite build`.
const rawPort = process.env.PORT;
const port = Number(rawPort ?? '3000');
const basePath = process.env.BASE_PATH ?? '/';

// Local dev API proxy — points at the Express API server.
// In production, VITE_API_URL is used directly (set in Vercel env vars).
const localApiTarget =
  process.env.VITE_API_URL ?? 'http://localhost:5000';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: Number.isNaN(port) || port <= 0 ? 3000 : port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: localApiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: Number.isNaN(port) || port <= 0 ? 3000 : port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
