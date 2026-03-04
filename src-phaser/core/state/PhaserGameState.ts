import {
  CharacterId,
  FloorPickupId,
  ItemKind,
  PauseReason,
  PassiveId,
  WeaponId,
  type UpgradeOption,
  type WeaponStats,
  type PlayerStats,
} from "@/types";
import { CHARACTERS } from "@/data/config/characters";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { PASSIVES, MAX_PASSIVE_SLOTS } from "@/data/config/passives";
import { FLOOR_PICKUPS } from "@/data/config/floorPickups";
import { applyPassivesToPlayerStats, applyPassivesToWeaponStats, accumulatePassiveEffects } from "@/utils/passives/passiveUtils";
import { resolveWeaponStats } from "@/utils/weapons/weaponUtils";
import type { PhaserPlayerState } from "../types";

const BASE_WEAPON_POOL: WeaponId[] = [
  WeaponId.Sabra,
  WeaponId.KeterChairs,
  WeaponId.Kaparot,
  WeaponId.Pitas,
  WeaponId.StarOfDavid,
];

export class PhaserGameState {
  isRunning = false;
  isPaused = false;
  pauseReason = PauseReason.None;
  isGameOver = false;
  runTimer = 0;
  level = 1;
  xp = 0;
  nextLevelXp = 100;
  gold = 0;
  killCount = 0;
  selectedCharacterId = CharacterId.Srulik;
  activeWeapons: WeaponId[] = [];
  activeItems: PassiveId[] = [];
  weaponLevels: Partial<Record<WeaponId, number>> = {};
  passiveLevels: Partial<Record<PassiveId, number>> = {};
  upgradeChoices: UpgradeOption[] = [];
  playerStats: PlayerStats = { ...CHARACTERS[CharacterId.Srulik].stats };
  currentHealth = this.playerStats.maxHealth;
  player: PhaserPlayerState = {
    characterId: CharacterId.Srulik,
    position: { x: 0, y: 0 },
    direction: { x: 1, y: 0 },
    facingLeft: false,
  };

  startGame(characterId: CharacterId): void {
    const character = CHARACTERS[characterId];
    if (!character) return;

    this.isRunning = true;
    this.isPaused = false;
    this.pauseReason = PauseReason.None;
    this.isGameOver = false;
    this.runTimer = 0;
    this.level = 1;
    this.xp = 0;
    this.nextLevelXp = 100;
    this.gold = 0;
    this.killCount = 0;
    this.selectedCharacterId = characterId;
    this.activeWeapons = [character.starting_weapon_id];
    this.activeItems = [];
    this.weaponLevels = { [character.starting_weapon_id]: 1 };
    this.passiveLevels = {};
    this.upgradeChoices = [];
    this.playerStats = { ...character.stats };
    this.currentHealth = character.stats.maxHealth;
    this.player = {
      characterId,
      position: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      facingLeft: false,
    };
  }

  updateTimer(deltaSeconds: number): void {
    if (!this.isRunning || this.isPaused) return;
    this.runTimer += deltaSeconds;
  }

  pauseGame(reason = PauseReason.Manual): void {
    if (!this.isRunning || this.isGameOver) return;
    this.isPaused = true;
    this.pauseReason = reason;
  }

  resumeGame(): void {
    if (!this.isRunning || this.isGameOver) return;
    this.isPaused = false;
    this.pauseReason = PauseReason.None;
  }

  togglePause(): void {
    if (this.isPaused) this.resumeGame();
    else this.pauseGame(PauseReason.Manual);
  }

  endGame(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.pauseReason = PauseReason.None;
    this.isGameOver = true;
  }

  setPlayerPosition(x: number, y: number): void {
    this.player.position = { x, y };
  }

  setPlayerDirection(x: number, y: number): void {
    this.player.direction = { x, y };
    if (x < 0) this.player.facingLeft = true;
    if (x > 0) this.player.facingLeft = false;
  }

  takeDamage(amount: number): number {
    const effective = this.getEffectivePlayerStats();
    const reducedDamage = Math.max(1, amount - effective.armor);
    this.currentHealth = Math.max(0, this.currentHealth - reducedDamage);
    if (this.currentHealth <= 0) this.endGame();
    return this.currentHealth;
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(
      this.getEffectivePlayerStats().maxHealth,
      this.currentHealth + amount,
    );
  }

  collectPickup(pickupId: FloorPickupId): void {
    const pickup = FLOOR_PICKUPS[pickupId];
    if (pickup?.healAmount) this.heal(pickup.healAmount);
  }

  addKill(): void {
    this.killCount += 1;
  }

  addGold(amount: number): void {
    this.gold += amount;
  }

  addXp(amount: number): void {
    this.xp += amount;
    while (this.xp >= this.nextLevelXp) {
      this.xp -= this.nextLevelXp;
      this.levelUp();
      if (this.pauseReason === PauseReason.LevelUp) break;
    }
  }

  levelUp(): void {
    this.level += 1;
    this.nextLevelXp = Math.floor(this.nextLevelXp * 1.2);
    this.pauseGame(PauseReason.LevelUp);
    this.upgradeChoices = this.buildUpgradeChoices();
  }

  applyUpgrade(choice: UpgradeOption): void {
    if (choice.kind === ItemKind.Weapon) {
      if (choice.isNew) {
        this.addWeapon(choice.weaponId);
      } else {
        this.levelUpWeapon(choice.weaponId);
      }
      this.tryEvolutionFor(choice.weaponId);
    } else if (choice.kind === ItemKind.Passive) {
      if (choice.isNew) this.addPassive(choice.passiveId);
      else this.levelUpPassive(choice.passiveId);
    }

    this.resumeFromLevelUp();
  }

  resumeFromLevelUp(): void {
    this.upgradeChoices = [];
    this.resumeGame();
  }

  addWeapon(weaponId: WeaponId): void {
    if (this.activeWeapons.includes(weaponId)) return;
    this.activeWeapons.push(weaponId);
    this.weaponLevels[weaponId] = 1;
  }

  levelUpWeapon(weaponId: WeaponId): void {
    this.weaponLevels[weaponId] = (this.weaponLevels[weaponId] ?? 1) + 1;
  }

  addPassive(passiveId: PassiveId): void {
    if (this.activeItems.includes(passiveId)) return;
    this.activeItems.push(passiveId);
    this.passiveLevels[passiveId] = 1;
  }

  levelUpPassive(passiveId: PassiveId): void {
    this.passiveLevels[passiveId] = (this.passiveLevels[passiveId] ?? 1) + 1;
  }

  getAccumulatedPassiveEffects() {
    return accumulatePassiveEffects({
      activeItems: this.activeItems,
      passiveLevels: this.passiveLevels,
    });
  }

  getEffectivePlayerStats(): PlayerStats {
    return applyPassivesToPlayerStats(this.playerStats, this.getAccumulatedPassiveEffects());
  }

  getWeaponStats(weaponId: WeaponId): WeaponStats {
    const def = WEAPONS[weaponId];
    const level = this.weaponLevels[weaponId] ?? 1;
    const baseStats = resolveWeaponStats(def, level);
    return applyPassivesToWeaponStats(baseStats, this.getAccumulatedPassiveEffects());
  }

  forceLevelUpForTests(choices: UpgradeOption[]): void {
    this.pauseGame(PauseReason.LevelUp);
    this.upgradeChoices = choices;
  }

  private tryEvolutionFor(weaponId: WeaponId): void {
    const def = WEAPONS[weaponId];
    if (!def.evolution) return;
    const max = def.maxLevel ?? 1;
    const currentLevel = this.weaponLevels[weaponId] ?? 1;
    if (currentLevel < max) return;
    if (!this.activeItems.includes(def.evolution.passiveRequired)) return;

    const evolvedId = def.evolution.evolvesTo;
    this.activeWeapons = this.activeWeapons.filter((id) => id !== weaponId);
    this.activeWeapons.push(evolvedId);
    delete this.weaponLevels[weaponId];
    this.weaponLevels[evolvedId] = 1;
  }

  private buildUpgradeChoices(): UpgradeOption[] {
    const choices: UpgradeOption[] = [];

    this.activeWeapons.forEach((weaponId) => {
      const def = WEAPONS[weaponId];
      const level = this.weaponLevels[weaponId] ?? 1;
      const max = def.maxLevel ?? level;
      if (level < max) {
        choices.push({
          kind: ItemKind.Weapon,
          weaponId,
          isNew: false,
          currentLevel: level,
        });
      } else if (
        def.evolution &&
        this.activeItems.includes(def.evolution.passiveRequired)
      ) {
        choices.push({
          kind: ItemKind.Weapon,
          weaponId: def.evolution.evolvesTo,
          isNew: true,
          currentLevel: 0,
        });
      }
    });

    BASE_WEAPON_POOL.filter((id) => !this.activeWeapons.includes(id)).forEach((weaponId) => {
      choices.push({
        kind: ItemKind.Weapon,
        weaponId,
        isNew: true,
        currentLevel: 0,
      });
    });

    const hasPassiveSlots = this.activeItems.length < MAX_PASSIVE_SLOTS;
    this.activeItems.forEach((passiveId) => {
      const def = PASSIVES[passiveId];
      const level = this.passiveLevels[passiveId] ?? 1;
      const max = def.maxLevel ?? level;
      if (level < max) {
        choices.push({
          kind: ItemKind.Passive,
          passiveId,
          isNew: false,
          currentLevel: level,
        });
      }
    });

    if (hasPassiveSlots) {
      (Object.keys(PASSIVES) as PassiveId[])
        .filter((id) => !this.activeItems.includes(id))
        .forEach((passiveId) => {
          choices.push({
            kind: ItemKind.Passive,
            passiveId,
            isNew: true,
            currentLevel: 0,
          });
        });
    }

    return shuffle(choices).slice(0, 3);
  }
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j] as T;
    result[j] = temp as T;
  }
  return result;
}
