// @ts-nocheck
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import wyw from "@wyw-in-js/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure assets resolve correctly when hosted at /demografia/ on GitHub Pages
  base: mode === "production" ? "/demografia/" : "/",
  plugins: [
    react(),
    wyw({
      include: ["./src/**/*.{ts,tsx}"],
      babelOptions: {
        presets: ["@babel/preset-typescript", "@babel/preset-react"],
      },
      displayName: true,
    }),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.json",
        buildMode: true,
      },
      eslint: {
        // Use ESLint flat config directly
        lintCommand: 'eslint "./src/**/*.{ts,tsx}" --max-warnings 0',
        useFlatConfig: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    exclude: ["@react-three/rapier"],
  },
  server: {
    watch: {
      ignored: ["./node_modules/**/*"],
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
}));
