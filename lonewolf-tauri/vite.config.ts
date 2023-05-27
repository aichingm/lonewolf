import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import vueJsx from "@vitejs/plugin-vue-jsx";

// https://github.com/vbenjs/vite-plugin-compression
import viteCompression from "vite-plugin-compression";
// https://nodejs.org/dist/latest/docs/api/zlib.html
import zlib from "zlib";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],
  resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@platform": fileURLToPath(new URL("./platform-src", import.meta.url)),
        },
        preserveSymlinks: true,
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
}));
