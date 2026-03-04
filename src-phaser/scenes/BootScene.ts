import Phaser from "phaser";
import {
  banners,
  sprites,
  icons,
  passiveSprites,
  bg,
} from "@/assets/assetPaths";
import { UI_STRINGS } from "@/data/config/ui";
import { preloadConfiguredSpriteSheets } from "../core/rendering/spriteSheet";

export class BootScene extends Phaser.Scene {
  static key = "BootScene";

  constructor() {
    super(BootScene.key);
  }

  preload(): void {
    this.load.image("banner-main", banners.main);
    this.load.image("bg-tel-aviv-loop", bg.telAvivLoop);
    preloadConfiguredSpriteSheets(this);

    Object.entries(sprites).forEach(([key, url]) => {
      this.load.image(`sprite-${key}`, url);
      this.load.image(url, url);
    });

    Object.entries(icons).forEach(([key, url]) => {
      this.load.image(`icon-${key}`, url);
      this.load.image(url, url);
    });

    Object.values(passiveSprites).forEach((url) => {
      this.load.image(url, url);
    });
  }

  create(): void {
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        UI_STRINGS.common.press_to_start,
        {
          color: "#ffffff",
          fontSize: "22px",
          rtl: true,
        },
      )
      .setOrigin(0.5);
    this.time.delayedCall(200, () => {
      this.scene.start("MainMenuScene");
    });
  }
}
