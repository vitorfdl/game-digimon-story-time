import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

const proxyConfig = {
  "/api/grindosaur": {
    target: "https://www.grindosaur.com",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/grindosaur/, ""),
  },
} as const

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages under /game-help-sos-grand-bazaar/
  base: "/game-help-sos-grand-bazaar/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: proxyConfig,
  },
  preview: {
    proxy: proxyConfig,
  },
})
