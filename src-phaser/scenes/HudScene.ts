import Phaser from "phaser";
import { ItemKind, PauseReason, type UpgradeOption, type WeaponId } from "@/types";
import { UI_STRINGS } from "@/data/config/ui";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { PASSIVES } from "@/data/config/passives";
import { runtimeState } from "../core/state/RuntimeState";
import { createTextButton } from "./ui";
import { PHASER_HUD } from "../core/config";

export class HudScene extends Phaser.Scene {
  static key = "HudScene";

  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private healthFill!: Phaser.GameObjects.Rectangle;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private weaponIcons: Phaser.GameObjects.Image[] = [];
  private levelUpLayer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super(HudScene.key);
  }

  create(): void {
    this.levelText = this.add.text(20, 20, "", { color: "#ffffff", fontSize: "24px" }).setScrollFactor(0);
    this.timerText = this.add.text(this.scale.width / 2, 20, "", {
      color: "#ffffff",
      fontSize: "32px",
    }).setOrigin(0.5, 0).setScrollFactor(0);
    this.goldText = this.add.text(this.scale.width - 20, 20, "", {
      color: "#f0d270",
      fontSize: "24px",
    }).setOrigin(1, 0).setScrollFactor(0);

    const xpBarX = 160;
    const xpBarY = 66;
    const xpBg = this.add
      .rectangle(xpBarX, xpBarY, PHASER_HUD.XP_BAR_WIDTH, PHASER_HUD.XP_BAR_HEIGHT, 0x444444)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    xpBg.setStrokeStyle(2, 0xffffff);
    // Fill inset by 2px on each side to sit inside the stroke.
    this.xpFill = this.add
      .rectangle(xpBarX + 2, xpBarY, 0, PHASER_HUD.XP_BAR_HEIGHT - 4, 0x44ff44)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    const hpHalf = PHASER_HUD.HEALTH_BAR_WIDTH / 2;
    const healthBg = this.add
      .rectangle(
        this.scale.width / 2 - hpHalf,
        this.scale.height - 36,
        PHASER_HUD.HEALTH_BAR_WIDTH,
        PHASER_HUD.HEALTH_BAR_HEIGHT,
        0x444444,
      )
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    healthBg.setStrokeStyle(2, 0xffffff);
    this.healthFill = this.add
      .rectangle(
        this.scale.width / 2 - hpHalf + 2,
        this.scale.height - 36,
        PHASER_HUD.HEALTH_BAR_WIDTH - 4,
        PHASER_HUD.HEALTH_BAR_HEIGHT - 4,
        0xff4444,
      )
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.healthText = this.add.text(this.scale.width / 2, this.scale.height - 60, "", {
      color: "#ffffff",
      fontSize: "20px",
    }).setOrigin(0.5).setScrollFactor(0);
  }

  update(): void {
    const game = runtimeState.game;
    if (!game.isRunning || game.isGameOver) return;

    const minutes = Math.floor(game.runTimer / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(game.runTimer % 60)
      .toString()
      .padStart(2, "0");

    const stats = game.getEffectivePlayerStats();
    const healthPercent = Phaser.Math.Clamp(game.currentHealth / stats.maxHealth, 0, 1);
    const xpPercent = Phaser.Math.Clamp(game.xp / game.nextLevelXp, 0, 1);

    this.levelText.setText(`${UI_STRINGS.common.level}: ${game.level}`);
    this.timerText.setText(`${minutes}:${seconds}`);
    this.goldText.setText(`${UI_STRINGS.common.gold}: ${game.gold}`);
    this.healthText.setText(`${Math.ceil(game.currentHealth)} / ${Math.ceil(stats.maxHealth)}`);
    this.xpFill.width = (PHASER_HUD.XP_BAR_WIDTH - 4) * xpPercent;
    this.healthFill.width = (PHASER_HUD.HEALTH_BAR_WIDTH - 4) * healthPercent;

    this.renderWeaponIcons(game.activeWeapons);

    if (game.pauseReason === PauseReason.LevelUp) {
      this.showLevelUpOverlay(game.upgradeChoices);
    } else if (this.levelUpLayer) {
      this.levelUpLayer.destroy(true);
      this.levelUpLayer = null;
      this.scene.resume("GameScene");
    }
  }

  private renderWeaponIcons(weaponIds: WeaponId[]): void {
    this.weaponIcons.forEach((icon) => icon.destroy());
    this.weaponIcons = [];
    weaponIds.forEach((weaponId, index) => {
      const weapon = WEAPONS[weaponId];
      const iconSize = PHASER_HUD.WEAPON_ICON_SIZE;
      const icon = this.add
        .image(this.scale.width - iconSize - 1, 120 + index * (iconSize + 14), weapon.sprite_config.iconUrl ?? weapon.sprite_config.textureUrl)
        .setDisplaySize(iconSize, iconSize)
        .setScrollFactor(0);
      this.weaponIcons.push(icon);
    });
  }

  private showLevelUpOverlay(choices: UpgradeOption[]): void {
    if (this.levelUpLayer) return;

    const layer = this.add.container(0, 0);
    const bg = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, PHASER_HUD.LEVEL_UP_BG_ALPHA)
      .setScrollFactor(0);
    const panel = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, PHASER_HUD.LEVEL_UP_PANEL_WIDTH, PHASER_HUD.LEVEL_UP_PANEL_HEIGHT, 0x222222, PHASER_HUD.LEVEL_UP_PANEL_ALPHA)
      .setScrollFactor(0);
    panel.setStrokeStyle(2, 0xffffff);
    const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 180, UI_STRINGS.level_up.choose_one, {
      color: "#ffffff",
      fontSize: "30px",
    }).setOrigin(0.5).setScrollFactor(0);
    layer.add([bg, panel, title]);

    const buttons: Phaser.GameObjects.Container[] = [];
    choices.forEach((choice, index) => {
      const y = this.scale.height / 2 - 90 + index * 96;
      const label = this.labelForChoice(choice);
      const button = createTextButton(this, this.scale.width / 2, y, label, () => {
        runtimeState.game.applyUpgrade(choice);
        if (this.levelUpLayer) {
          this.levelUpLayer.destroy(true);
          this.levelUpLayer = null;
        }
        this.scene.resume("GameScene");
      }, { width: 500 });
      buttons.push(button);
      layer.add(button);
    });

    this.levelUpLayer = layer;

    if (buttons.length > 0) {
      let selected = 0;
      const applyFocus = () => {
        buttons.forEach((button, index) => {
          const bg = button.list[0];
          if (bg instanceof Phaser.GameObjects.Rectangle) {
            bg.setStrokeStyle(3, index === selected ? 0xffd54a : 0xffffff);
          }
        });
      };
      applyFocus();

      const onUp = () => {
        selected = (selected - 1 + buttons.length) % buttons.length;
        applyFocus();
      };
      const onDown = () => {
        selected = (selected + 1) % buttons.length;
        applyFocus();
      };
      const onEnter = () => buttons[selected]?.emit("pointerdown");
      this.input.keyboard?.on("keydown-UP", onUp);
      this.input.keyboard?.on("keydown-DOWN", onDown);
      this.input.keyboard?.on("keydown-ENTER", onEnter);
      this.input.keyboard?.on("keydown-SPACE", onEnter);
    }
  }

  private labelForChoice(choice: UpgradeOption): string {
    if (choice.kind === ItemKind.Weapon) {
      const weapon = WEAPONS[choice.weaponId];
      return choice.isNew
        ? `${UI_STRINGS.level_up.weapon_new_prefix}: ${weapon.name_he}`
        : `${UI_STRINGS.level_up.weapon_upgrade_prefix}: ${weapon.name_he}`;
    }
    const passive = PASSIVES[choice.passiveId];
    return choice.isNew
      ? `${UI_STRINGS.level_up.passive_prefix}${passive.name_he}`
      : `${UI_STRINGS.level_up.passive_prefix}${passive.name_he} Lv${choice.currentLevel + 1}`;
  }
}
