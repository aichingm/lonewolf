import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://github.com/vbenjs/vite-plugin-compression
import viteCompression from "vite-plugin-compression";
// https://nodejs.org/dist/latest/docs/api/zlib.html
import zlib from "zlib";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        viteCompression({
            algorithm: "brotliCompress",
            filter: /\.(js|mjs|json|css|html|svg)$/i,
            threshold: 100,
            compressionOptions: {
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]:
            zlib.constants.BROTLI_MAX_QUALITY,
                    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
                },
            },
        }),
        viteCompression({
            algorithm: "gzip",
            filter: /\.(js|mjs|json|css|html|svg)$/i,
            threshold: 100,
            compressionOptions: {
                level: zlib.constants.Z_BEST_COMPRESSION,
                strategy: zlib.constants.Z_DEFAULT_STRATEGY,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
