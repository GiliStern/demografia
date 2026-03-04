import Phaser from "phaser";
import { CHARACTERS } from "@/data/config/characters";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { CharacterId } from "@/types";
import { UI_STRINGS } from "@/data/config/ui";
import { runtimeState } from "../core/state/RuntimeState";
import { createTextButton } from "./ui";

export class CharacterSelectionScene extends Phaser.Scene {
  static key = "CharacterSelectionScene";

  constructor() {
    super(CharacterSelectionScene.key);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const startY = 140;
    this.add.rectangle(
      centerX,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.94,
    );
    this.add
      .text(centerX, 56, UI_STRINGS.character_select.title, {
        color: "#ffffff",
        fontSize: "34px",
        rtl: true,
      })
      .setOrigin(0.5);

    const entries = Object.values(CHARACTERS);
    const cards: Phaser.GameObjects.Container[] = [];
    entries.forEach((character, index) => {
      const y = startY + index * 140;
      const card = this.createCharacterCard(centerX, y, character.id);
      cards.push(card);
    });

    const backButton = createTextButton(
      this,
      centerX,
      this.scale.height - 70,
      UI_STRINGS.common.back,
      () => {
        this.scene.start("MainMenuScene");
      },
      { width: 260 },
    );

    // Keyboard navigation for character selection + back.
    const actionable = [...cards, backButton];
    let selected = 0;
    const applyFocus = () => {
      actionable.forEach((item, index) => {
        const bg = item.list[0];
        if (bg instanceof Phaser.GameObjects.Rectangle) {
          bg.setStrokeStyle(3, index === selected ? 0xffd54a : 0x555555);
        }
      });
    };
    applyFocus();

    this.input.keyboard?.on("keydown-UP", () => {
      selected = (selected - 1 + actionable.length) % actionable.length;
      applyFocus();
    });
    this.input.keyboard?.on("keydown-DOWN", () => {
      selected = (selected + 1) % actionable.length;
      applyFocus();
    });
    this.input.keyboard?.on("keydown-ENTER", () => {
      actionable[selected]?.emit("pointerdown");
    });
    this.input.keyboard?.on("keydown-ESC", () => {
      backButton.emit("pointerdown");
    });
  }

  private createCharacterCard(
    x: number,
    y: number,
    characterId: CharacterId,
  ): Phaser.GameObjects.Container {
    const character = CHARACTERS[characterId];
    const weapon = WEAPONS[character.starting_weapon_id];
    const container = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, 620, 110, 0x181818, 0.92)
      .setStrokeStyle(2, 0x555555);
    const portrait = this.add
      .image(-260, 0, character.sprite_config.textureUrl)
      .setScale(0.25);
    const name = this.add.text(-190, -30, character.name_he, {
      color: "#ffffff",
      fontSize: "28px",
      rtl: true,
    });
    const desc = this.add.text(-190, 10, character.description_he, {
      color: "#dddddd",
      fontSize: "18px",
      rtl: true,
    });
    const weaponText = this.add
      .text(120, 0, weapon.name_he, {
        color: "#ffdd66",
        fontSize: "18px",
        rtl: true,
      })
      .setOrigin(0.5);
    container.add([bg, portrait, name, desc, weaponText]);
    container.setSize(620, 110);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-310, -55, 620, 110),
      (rect: Phaser.Geom.Rectangle, x: number, y: number) =>
        Phaser.Geom.Rectangle.Contains(rect, x, y),
    );
    container.on("pointerover", () => bg.setFillStyle(0x242424));
    container.on("pointerout", () => bg.setFillStyle(0x181818));
    container.on("pointerdown", () => {
      runtimeState.resetRuntime();
      runtimeState.game.startGame(characterId);
      this.scene.start("GameScene");
      this.scene.launch("HudScene");
    });
    return container;
  }
}
