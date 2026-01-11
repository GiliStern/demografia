// @ts-nocheck
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure assets resolve correctly when hosted at /demografia/ on GitHub Pages
  base: mode === "production" ? "/demografia/" : "/",
  plugins: [
    react({
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
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
}));
