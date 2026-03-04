import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { CharacterSelectionScene } from "../scenes/CharacterSelectionScene";
import { GameScene } from "../scenes/GameScene";
import { HudScene } from "../scenes/HudScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { PHASER_RENDERER } from "../core/config";

export const createPhaserGame = (container: string | HTMLElement): Phaser.Game =>
  new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: PHASER_RENDERER.BACKGROUND_COLOR,
    parent: container,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: PHASER_RENDERER.PIXEL_ART,
    roundPixels: PHASER_RENDERER.ROUND_PIXELS,
    fps: { target: PHASER_RENDERER.TARGET_FPS },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
      BootScene,
      MainMenuScene,
      CharacterSelectionScene,
      GameScene,
      HudScene,
      GameOverScene,
    ],
  });
