import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/malebog/",
  resolve: {
    alias: {
      "@/hooks/use-motifs": path.resolve(import.meta.dirname, "client", "src", "hooks", "use-motifs.pages.ts"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist-pages"),
    manifest: true,
    emptyOutDir: true,
  },
});
