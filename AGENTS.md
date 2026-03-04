# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Demografia is a client-side browser arcade game. The `gili-phaser-migration` branch migrates the game engine from React Three Fiber (three.js) to Phaser.js. Both implementations coexist:

- **Original (R3F):** `src/`, entry `index.html`, config `vite.config.ts`
- **Phaser (new):** `src-phaser/`, entry `index-phaser.html`, config `vite.phaser.config.ts`

No backend, database, or external service dependencies. Everything runs in the browser.

### Quick reference

| Task | Command |
|------|---------|
| Phaser dev server | `npm run dev:phaser` (port 5173, runs lint first) |
| Phaser lint (strict) | `npm run lint:phaser` |
| Phaser unit tests | `npm run test:phaser` |
| Phaser E2E tests | `npm run test:e2e:phaser` |
| Phaser build (gated) | `npm run build:phaser` |
| Phaser preview | `npm run preview:phaser` |
| Full lint | `npm run lint` |
| R3F dev server | `npm run dev` (legacy, port 5173) |
| R3F build | `npm run build` |

See `README.md` and `package.json` for full script details.

### Non-obvious notes

- **Use `npm`, not `yarn`:** The `yarn.lock` is stale on this branch (missing `phaser` and `@playwright/test`). The authoritative lockfile is `package-lock.json`. Always use `npm install`.
- **Playwright browsers:** After `npm install`, run `npx playwright install --with-deps chromium` to install the Chromium browser needed for E2E tests. The E2E config starts its own dev server on port 4177.
- **Node v22+** is required (`.nvmrc` pins 22.14.0).
- **`dev:phaser` runs lint first:** The script is `npm run lint:phaser && vite --config vite.phaser.config.ts --open /index-phaser.html`. If you just want the dev server without lint gating, run `npx vite --config vite.phaser.config.ts` directly.
- **`build:phaser` is fully gated:** It chains lint, unit tests, E2E tests, `tsc`, and Vite build. For a quick build without gates, use `npx vite build --config vite.phaser.config.ts`.
- **Shared config data:** Phaser code imports game config (weapons, enemies, characters, waves) from `src/data/config/`, so changes there affect both implementations.
- No environment variables are required for local development.
- There is one pre-existing test failure in the R3F tests (`src/utils/weapons/weapons.test.ts`). This does not affect Phaser tests.
