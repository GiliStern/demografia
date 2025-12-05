// ESLint flat config for TS + Prettier
import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    files: ['src/**/*.{ts,tsx,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['src/**/*.js'],
    rules: {
      // Relax for legacy JS during migration; TS modules will replace globals
      'no-undef': 'off',
      'no-async-promise-executor': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
