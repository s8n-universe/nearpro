import { defineConfig } from "vite";

export default defineConfig({
  // Direct build output into a production build directory
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
