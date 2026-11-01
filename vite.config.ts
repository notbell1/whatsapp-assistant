import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const contentEntry = resolve(__dirname, "src/content/index.ts");
const contentCssSource = resolve(__dirname, "src/content/ui/styles.css");
const popupEntry = resolve(__dirname, "src/popup/index.ts");
const popupCssSource = resolve(__dirname, "src/popup/styles.css");
const popupHtmlSource = resolve(__dirname, "src/popup/index.html");

function buildExtensionAssets() {
  return {
    name: "build-extension-assets",

    async closeBundle() {
      console.log("Building WhatsApp Assistant extension assets...");

      // 1. Build Content Script (IIFE for isolated content script execution)
      await esbuild({
        entryPoints: [contentEntry],
        bundle: true,
        outfile: resolve(__dirname, "dist/content.js"),
        format: "iife",
        platform: "browser",
        target: "chrome120",
        minify: false,
        sourcemap: false,
        tsconfig: resolve(__dirname, "tsconfig.json"),
      });

      // 2. Build Popup Script
      if (fs.existsSync(popupEntry)) {
        await esbuild({
          entryPoints: [popupEntry],
          bundle: true,
          outfile: resolve(__dirname, "dist/popup.js"),
          format: "esm",
          platform: "browser",
          target: "chrome120",
          minify: false,
          sourcemap: false,
          tsconfig: resolve(__dirname, "tsconfig.json"),
        });
      }

      // 3. Copy Content CSS
      if (fs.existsSync(contentCssSource)) {
        fs.copyFileSync(
          contentCssSource,
          resolve(__dirname, "dist/content.css"),
        );
      }

      // 4. Copy Popup CSS
      if (fs.existsSync(popupCssSource)) {
        fs.copyFileSync(
          popupCssSource,
          resolve(__dirname, "dist/popup.css"),
        );
      }

      // 5. Build Popup HTML with correct script and css paths
      if (fs.existsSync(popupHtmlSource)) {
        let htmlContent = fs.readFileSync(popupHtmlSource, "utf-8");
        htmlContent = htmlContent.replace("./index.ts", "./popup.js");
        htmlContent = htmlContent.replace("./styles.css", "./popup.css");
        fs.writeFileSync(resolve(__dirname, "dist/popup.html"), htmlContent);
      }

      // 6. Copy Manifest
      fs.copyFileSync(
        resolve(__dirname, "manifest.json"),
        resolve(__dirname, "dist/manifest.json"),
      );

      // 7. Copy Icons
      const iconsDir = resolve(__dirname, "public/icons");
      const distIconsDir = resolve(__dirname, "dist/icons");
      if (fs.existsSync(iconsDir)) {
        if (!fs.existsSync(distIconsDir)) {
          fs.mkdirSync(distIconsDir, { recursive: true });
        }
        for (const file of fs.readdirSync(iconsDir)) {
          fs.copyFileSync(resolve(iconsDir, file), resolve(distIconsDir, file));
        }
      }

      console.log("✓ content.js built");
      console.log("✓ popup.js built");
      console.log("✓ content.css copied");
      console.log("✓ popup.css & popup.html copied");
      console.log("✓ manifest.json copied");
      console.log("✓ icons copied");
    },
  };
}

export default defineConfig({
  plugins: [buildExtensionAssets()],

  build: {
    emptyOutDir: true,

    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/index.ts"),
      },

      output: {
        format: "es",

        entryFileNames: (chunk) => {
          if (chunk.name === "background") {
            return "background.js";
          }

          return "assets/[name].js";
        },

        chunkFileNames: "assets/[name].js",

        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
