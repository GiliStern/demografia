import Phaser from "phaser";
import { UI_STRINGS } from "@/data/config/ui";
import { runtimeState } from "../core/state/RuntimeState";
import { createTextButton } from "./ui";

export class GameOverScene extends Phaser.Scene {
  static key = "GameOverScene";

  constructor() {
    super(GameOverScene.key);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const game = runtimeState.game;

    this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x320000, 0.9);
    this.add.text(centerX, centerY - 170, "הפסדת!", {
      color: "#ff4444",
      fontSize: "64px",
    }).setOrigin(0.5);

    const minutes = Math.floor(game.runTimer / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(game.runTimer % 60)
      .toString()
      .padStart(2, "0");

    this.add.text(centerX, centerY - 40, `${UI_STRINGS.common.time}: ${minutes}:${seconds}`, {
      color: "#ffffff",
      fontSize: "32px",
    }).setOrigin(0.5);
    this.add.text(centerX, centerY + 15, `${UI_STRINGS.common.gold}: ${game.gold}`, {
      color: "#ffffff",
      fontSize: "32px",
    }).setOrigin(0.5);
    this.add.text(centerX, centerY + 70, `הריגות: ${game.killCount}`, {
      color: "#ffffff",
      fontSize: "32px",
    }).setOrigin(0.5);

    createTextButton(this, centerX, centerY + 170, UI_STRINGS.common.main_menu, () => {
      runtimeState.resetRuntime();
      this.scene.stop("HudScene");
      this.scene.stop("GameScene");
      this.scene.start("MainMenuScene");
    }, { width: 280 });
  }
}
