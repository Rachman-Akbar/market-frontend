import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_BACKEND_TARGET = "http://127.0.0.1:8000";
const DEFAULT_REVERB_TARGET = "http://127.0.0.1:8080";

function safeTarget(value, browserPort, fallback) {
  const candidate = String(value || fallback).trim();

  try {
    const parsed = new URL(candidate);
    const localHost = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    const targetPort = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));

    if (localHost && targetPort === browserPort) {
      return fallback;
    }

    return parsed.origin;
  } catch {
    return fallback;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const browserHost = env.VITE_DEV_BROWSER_HOST || "127.0.0.1";
  const browserPort = Number(env.VITE_DEV_BROWSER_PORT || 5173);
  const backendTarget = safeTarget(env.VITE_DEV_BACKEND_TARGET, browserPort, DEFAULT_BACKEND_TARGET);
  const reverbTarget = safeTarget(env.VITE_DEV_REVERB_TARGET, browserPort, DEFAULT_REVERB_TARGET);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(currentDir, "src"),
      },
    },
    server: {
      host: browserHost,
      port: browserPort,
      strictPort: true,
      origin: `http://${browserHost}:${browserPort}`,
      hmr: {
        host: browserHost,
        port: browserPort,
      },
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        "/storage": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        "/app": {
          target: reverbTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
