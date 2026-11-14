import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  publicDir: resolve(here, "../public"),
  build: {
    outDir: resolve(here, "../out"),
    emptyOutDir: true,
    assetsDir: "static",
    assetsInlineLimit: 0,
    sourcemap: false,
  },
});
