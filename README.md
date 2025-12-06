# Demografia

Arcade-style survivor game built with Vite, React, TypeScript, and three.js helpers. This guide covers getting the project running locally.

Play now: [https://gilistern.github.io/demografia/](https://gilistern.github.io/demografia/)

![Demografia banner](./src/assets/main_banner.png)

## Prerequisites

- Node.js 18+ (Vite 5 requires Node 18 or newer)
- Yarn (classic) or npm; Yarn is preferred because a `yarn.lock` is checked in

## Setup

1. Install dependencies

   - With Yarn: `yarn install`
   - Or with npm: `npm install`

2. Start the dev server (defaults to http://localhost:5173):
   - `yarn dev`
   - Or: `npm run dev`  
     Add `--host` if you need LAN access: `yarn dev --host`

## Available scripts

- `yarn dev` – run the Vite dev server
- `yarn build` – type-check then create a production build
- `yarn preview` – serve the production build locally
- `yarn lint` – run ESLint for TypeScript/React files

## Project structure (high level)

- `src/` – game code (React components, hooks, Zustand store, config data)
- `public/assets/` – sprites, music, SFX, and backgrounds
- `plans/` – design and planning documents
- `vite.config.ts`, `tsconfig*.json` – build and TypeScript configuration

## Notes

- No extra environment variables are required for local runs.
- If assets fail to load, ensure you are running from the project root so Vite serves the `public/` folder correctly.
