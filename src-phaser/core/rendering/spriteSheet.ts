import Phaser from "phaser";
import { CHARACTERS } from "@/data/config/characters";
import { ENEMIES } from "@/data/config/enemies";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { sprites } from "@/assets/assetPaths";
import { PHASER_SPRITES } from "../config";

export const buildSheetKey = (textureUrl: string, frameSize: number): string =>
  `sheet::${textureUrl}::${frameSize}`;

export const preloadConfiguredSpriteSheets = (scene: Phaser.Scene): void => {
  const sheets = new Map<string, { textureUrl: string; frameSize: number }>();

  Object.values(CHARACTERS).forEach((character) => {
    const frameSize = character.sprite_config.spriteFrameSize ?? PHASER_SPRITES.DEFAULT_FRAME_SIZE;
    const textureUrl = character.sprite_config.textureUrl;
    sheets.set(buildSheetKey(textureUrl, frameSize), { textureUrl, frameSize });
  });

  Object.values(ENEMIES).forEach((enemy) => {
    const frameSize = enemy.sprite_config.spriteFrameSize ?? PHASER_SPRITES.DEFAULT_FRAME_SIZE;
    const textureUrl = enemy.sprite_config.textureUrl;
    sheets.set(buildSheetKey(textureUrl, frameSize), { textureUrl, frameSize });
  });

  Object.values(WEAPONS).forEach((weapon) => {
    const frameSize = weapon.sprite_config.spriteFrameSize ?? PHASER_SPRITES.DEFAULT_FRAME_SIZE;
    const textureUrl = weapon.sprite_config.textureUrl;
    sheets.set(buildSheetKey(textureUrl, frameSize), { textureUrl, frameSize });
  });

  sheets.set(buildSheetKey(sprites.xp, PHASER_SPRITES.ORB_FRAME_SIZE), {
    textureUrl: sprites.xp,
    frameSize: PHASER_SPRITES.ORB_FRAME_SIZE,
  });

  sheets.forEach(({ textureUrl, frameSize }, key) => {
    scene.load.spritesheet(key, textureUrl, {
      frameWidth: frameSize,
      frameHeight: frameSize,
    });
  });
};
