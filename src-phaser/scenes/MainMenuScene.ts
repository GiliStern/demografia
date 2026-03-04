import Phaser from "phaser";
import { UI_STRINGS } from "@/data/config/ui";
import { PauseReason } from "@/types";
import { runtimeState } from "../core/state/RuntimeState";
import { createTextButton } from "./ui";

export class MainMenuScene extends Phaser.Scene {
  static key = "MainMenuScene";

  constructor() {
    super(MainMenuScene.key);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.9);
    this.add.image(centerX, centerY - 180, "banner-main").setScale(0.65);

    const canResume =
      runtimeState.game.isRunning &&
      runtimeState.game.isPaused &&
      runtimeState.game.pauseReason === PauseReason.Manual;

    const actionableButtons: Phaser.GameObjects.Container[] = [];

    if (canResume) {
      this.add
        .text(centerX, centerY - 230, UI_STRINGS.common.paused, {
          color: "#ffffff",
          fontSize: "34px",
        })
        .setOrigin(0.5);
      const resumeButton = createTextButton(this, centerX, centerY - 110, UI_STRINGS.common.resume, () => {
        runtimeState.game.resumeGame();
        this.scene.stop(MainMenuScene.key);
        this.scene.resume("GameScene");
        this.scene.resume("HudScene");
      });
      actionableButtons.push(resumeButton);
    } else {
      const playButton = createTextButton(this, centerX, centerY - 110, UI_STRINGS.menu.play, () => {
        this.scene.start("CharacterSelectionScene");
      });
      actionableButtons.push(playButton);
    }

    createTextButton(
      this,
      centerX,
      centerY - 35,
      `${UI_STRINGS.menu.meta_shop} (${UI_STRINGS.common.locked})`,
      () => {},
      { disabled: true },
    );
    createTextButton(
      this,
      centerX,
      centerY + 40,
      `${UI_STRINGS.menu.settings} (${UI_STRINGS.common.locked})`,
      () => {},
      { disabled: true },
    );

    this.add
      .text(16, this.scale.height - 24, `${UI_STRINGS.menu.version} ${APP_VERSION}`, {
        color: "#6b6b6b",
        fontSize: "14px",
      })
      .setOrigin(0, 1);

    // Keyboard support: focus + Enter activation.
    if (actionableButtons.length > 0) {
      let selected = 0;
      const applyFocus = () => {
        actionableButtons.forEach((button, index) => {
          const bg = button.list[0];
          if (bg instanceof Phaser.GameObjects.Rectangle) {
            bg.setStrokeStyle(3, index === selected ? 0xffd54a : 0xffffff);
          }
        });
      };
      applyFocus();

      this.input.keyboard?.on("keydown-UP", () => {
        selected = (selected - 1 + actionableButtons.length) % actionableButtons.length;
        applyFocus();
      });
      this.input.keyboard?.on("keydown-DOWN", () => {
        selected = (selected + 1) % actionableButtons.length;
        applyFocus();
      });
      this.input.keyboard?.on("keydown-ENTER", () => {
        actionableButtons[selected]?.emit("pointerdown");
      });
      this.input.keyboard?.on("keydown-SPACE", () => {
        actionableButtons[selected]?.emit("pointerdown");
      });
    }
  }
}
