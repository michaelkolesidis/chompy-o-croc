import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  server: {
    host: true,
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
