import { create } from "zustand";
import { WEAPONS } from "../data/config/weaponsConfig";
import { PASSIVES, MAX_PASSIVE_SLOTS } from "../data/config/passives";
import {
  type GameStore,
  type UpgradeOption,
  type WeaponsStore,
  PassiveId,
  ItemKind,
  WeaponId,
} from "../types";
import { createViewportStore } from "./viewportStore";
import { createXpOrbsStore } from "./xpOrbsStore";
import { createProjectilesStore } from "./projectilesStore";
import { createFloatingDamageStore } from "./floatingDamageStore";

const useGameStore = create<GameStore>()((...args) => ({
  ...createViewportStore(...args),
  ...createXpOrbsStore(...args),
  ...createProjectilesStore(...args),
  ...createFloatingDamageStore(...args),
}));

export { useGameStore };

/** Slice-specific hooks - same store, clearer intent per consumer */
export const useViewportStore = useGameStore;
export const useXpOrbsStore = useGameStore;
export const useProjectilesStore = useGameStore;
export const useFloatingDamageStore = useGameStore;

const BASE_WEAPON_POOL: WeaponId[] = [
  WeaponId.Sabra,
  WeaponId.KeterChairs,
  WeaponId.Kaparot,
  WeaponId.Pitas,
  WeaponId.StarOfDavid,
];

type UpgradeChoiceState = Pick<
  WeaponsStore,
  "activeWeapons" | "weaponLevels" | "activeItems" | "passiveLevels"
>;

interface LevelProgressionInput {
  level: number;
  xp: number;
  nextLevelXp: number;
  gainedXp: number;
}

interface LevelProgressionResult {
  level: number;
  xp: number;
  nextLevelXp: number;
  levelsGained: number;
}

export const resolveLevelProgression = ({
  level,
  xp,
  nextLevelXp,
  gainedXp,
}: LevelProgressionInput): LevelProgressionResult => {
  let nextLevel = level;
  let remainingXp = xp + gainedXp;
  let nextXpThreshold = nextLevelXp;
  let levelsGained = 0;

  while (remainingXp >= nextXpThreshold) {
    remainingXp -= nextXpThreshold;
    nextLevel += 1;
    levelsGained += 1;
    nextXpThreshold = Math.floor(nextXpThreshold * 1.2);
  }

  return {
    level: nextLevel,
    xp: remainingXp,
    nextLevelXp: nextXpThreshold,
    levelsGained,
  };
};

export const collectUpgradeChoices = (
  state: UpgradeChoiceState,
): UpgradeOption[] => {
  const choices: UpgradeOption[] = [];

  // Upgradable existing weapons
  state.activeWeapons.forEach((weaponId: WeaponId) => {
    const def = WEAPONS[weaponId];
    const level = state.weaponLevels[weaponId] ?? 1;
    const max = def?.maxLevel ?? level;
    if (def && level < max) {
      choices.push({
        kind: ItemKind.Weapon,
        weaponId,
        isNew: false,
        currentLevel: level,
      });
    } else if (
      def?.evolution &&
      state.activeItems.includes(def.evolution.passiveRequired) &&
      !state.activeWeapons.includes(def.evolution.evolvesTo)
    ) {
      choices.push({
        kind: ItemKind.Weapon,
        weaponId: def.evolution.evolvesTo,
        isNew: false,
        currentLevel: level,
        evolvesFrom: weaponId,
      });
    }
  });

  // New weapons
  BASE_WEAPON_POOL.filter((id) => !state.activeWeapons.includes(id)).forEach(
    (weaponId) => {
      choices.push({
        kind: ItemKind.Weapon,
        weaponId,
        isNew: true,
        currentLevel: 0,
      });
    },
  );

  // Upgradable existing passives
  state.activeItems.forEach((passiveId: PassiveId) => {
    const def = PASSIVES[passiveId];
    const level = state.passiveLevels[passiveId] ?? 1;
    const max = def?.maxLevel ?? level;
    if (def && level < max) {
      choices.push({
        kind: ItemKind.Passive,
        passiveId,
        isNew: false,
        currentLevel: level,
      });
    }
  });

  // New passives (only if under the slot limit)
  const hasPassiveSlots = state.activeItems.length < MAX_PASSIVE_SLOTS;
  if (hasPassiveSlots) {
    (Object.keys(PASSIVES) as PassiveId[])
      .filter((id) => !state.activeItems.includes(id))
      .forEach((passiveId) =>
        choices.push({
          kind: ItemKind.Passive,
          passiveId,
          isNew: true,
          currentLevel: 0,
        }),
      );
  }

  return choices;
};

export const buildUpgradeChoices = (
  state: UpgradeChoiceState,
): UpgradeOption[] => {
  // Shuffle and return first 3 choices (or fewer if not enough available)
  return shuffleArray(collectUpgradeChoices(state)).slice(0, 3);
};

/** Fisher-Yates shuffle */
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j] as T;
    result[j] = temp as T;
  }
  return result;
};
