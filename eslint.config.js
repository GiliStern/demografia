import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const tsProjectOptions = {
  parser: tsParser,
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: import.meta.dirname,
    ecmaVersion: 2020,
    sourceType: "module",
  },
};

export default [
  {
    ignores: ["dist", "node_modules", ".types", "*.d.ts", "vite.config.*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ...tsProjectOptions,
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs["recommended-type-checked"].rules,
      ...tsPlugin.configs["stylistic-type-checked"].rules,
      ...reactHooks.configs.recommended.rules,
      "no-undef": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
