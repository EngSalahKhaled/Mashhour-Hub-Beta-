import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // Local dev → "/" | Production build → "/admin/"
  base: mode === "development" ? "/" : "/admin/",
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["react-is", "recharts"],
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
}));
