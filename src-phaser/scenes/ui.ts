import Phaser from "phaser";
import { PHASER_HUD } from "../core/config";

export const createTextButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options?: { width?: number; disabled?: boolean },
): Phaser.GameObjects.Container => {
  const width = options?.width ?? PHASER_HUD.BUTTON_DEFAULT_WIDTH;
  const height = PHASER_HUD.BUTTON_HEIGHT;
  const disabled = Boolean(options?.disabled);

  const background = scene.add.rectangle(
    0,
    0,
    width,
    height,
    disabled ? 0x444444 : 0x222222,
  );
  background.setStrokeStyle(2, disabled ? 0x666666 : 0xffffff);

  const text = scene.add.text(0, 0, label, {
    fontSize: PHASER_HUD.BUTTON_FONT_SIZE,
    color: disabled ? "#9c9c9c" : "#ffffff",
    align: "center",
    rtl: true,
  });
  text.setOrigin(0.5);

  const container = scene.add.container(x, y, [background, text]);
  container.setSize(width, height);
  container.setDepth(100);

  if (!disabled) {
    // Ensure the full visual button area is clickable.
    background.setInteractive({ useHandCursor: true });
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      (rect: Phaser.Geom.Rectangle, x: number, y: number) =>
        Phaser.Geom.Rectangle.Contains(rect, x, y),
    );
    container.on("pointerover", () => background.setFillStyle(0x333333));
    container.on("pointerout", () => background.setFillStyle(0x222222));
    container.on("pointerdown", onClick);
    background.on("pointerdown", onClick);
  }

  return container;
};
