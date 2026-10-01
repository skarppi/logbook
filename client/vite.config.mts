import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
          if (id.includes("video-react")) {
            return "video";
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
});
