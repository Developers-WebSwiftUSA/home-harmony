import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Load VITE_* from repo root /.env (same file as backend)
  envDir: path.resolve(__dirname, ".."),
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
