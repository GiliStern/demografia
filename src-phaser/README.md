# Phaser Parallel App

This folder contains the parallel Phaser + TypeScript implementation of the game.

## Commands

- `npm run dev:phaser` - run Phaser app on `index-phaser.html`
- `npm run test:phaser` - run Phaser unit tests
- `npm run test:e2e:phaser` - run Phaser E2E suite
- `npm run build:phaser` - gated build (unit + E2E + compile + build)

## Architecture

- `core/state` - deterministic game and runtime state containers
- `core/input` - keyboard and touch joystick adapters
- `scenes` - menu, character select, gameplay, HUD, game-over scenes
- `docs/parity-matrix.md` - migration acceptance contract
