import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // When the dev server runs behind a TLS reverse proxy (e.g. Apache
  // forwarding https://public.host.name -> localhost:3000), the browser
  // can't reach the HMR WebSocket on localhost. Point the HMR client at the
  // public host/port instead. Leave these unset for plain local dev.
  //   VITE_HMR_HOST=public.host.name
  //   VITE_HMR_PROTOCOL=wss
  //   VITE_HMR_CLIENT_PORT=443
  const hmrHost = env.VITE_HMR_HOST;
  const hmr = hmrHost
    ? {
        host: hmrHost,
        protocol: env.VITE_HMR_PROTOCOL || "wss",
        clientPort: env.VITE_HMR_CLIENT_PORT
          ? Number(env.VITE_HMR_CLIENT_PORT)
          : 443,
      }
    : undefined;

  return {
  plugins: [react()],
  server: {
    port: 3000,
    hmr,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }
          if (id.includes("react-leaflet") || id.includes("/leaflet")) {
            return "maps";
          }
          if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
            return "charts";
          }
          if (id.includes("@mui") || id.includes("@emotion")) {
            return "mui";
          }
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("scheduler")
          ) {
            return "react-vendor";
          }
          if (
            id.includes("urql") ||
            id.includes("graphql") ||
            id.includes("axios")
          ) {
            return "data";
          }
          return "vendor";
        },
      },
    },
  },
  };
});
