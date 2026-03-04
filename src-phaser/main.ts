import { createPhaserGame } from "./game/createPhaserGame";
import { runtimeState } from "./core/state/RuntimeState";

const root = document.getElementById("phaser-root");
if (!root) {
  throw new Error("Missing #phaser-root element");
}

const game = createPhaserGame(root);

declare global {
  interface Window {
    __PHASER_GAME__?: unknown;
    __PHASER_RUNTIME__?: unknown;
  }
}

window.__PHASER_GAME__ = game;
window.__PHASER_RUNTIME__ = runtimeState;
