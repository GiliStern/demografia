# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Demografia is a client-side browser arcade game (React 18 + TypeScript + React Three Fiber + Vite 5). There is no backend, database, or external service dependency. The entire game runs in the browser.

### Quick reference

- **Dev server:** `yarn dev` (port 5173)
- **Lint:** `yarn lint`
- **Tests:** `yarn test --run` (non-watch) or `yarn test` (watch mode)
- **Build:** `yarn build` (runs `tsc` then `vite build`)
- **Storybook:** `yarn storybook` (port 6006, optional)

See `README.md` for full list of scripts and project structure.

### Non-obvious notes

- Node v22+ is required (`.nvmrc` pins 22.14.0). The environment ships with nvm; `nvm use` will activate the correct version if needed.
- The project uses Yarn Classic (v1). A `yarn.lock` is committed; prefer `yarn install` over `npm install`.
- A `package-lock.json` also exists in the repo, which triggers a Yarn warning during install. This is harmless.
- There is one pre-existing test failure in `src/utils/weapons/weapons.test.ts` (`resolveWeaponStats > applies Sabra level bonuses`). This is not caused by environment issues.
- No environment variables are required for local development.
- The Vite dev server supports `--host` for LAN access.
