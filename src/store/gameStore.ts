import { create } from "zustand";
import { CHARACTERS } from "../data/config/characters";
import { WEAPONS } from "../data/config/weaponsConfig";
import { PASSIVES, MAX_PASSIVE_SLOTS } from "../data/config/passives";
import { FLOOR_PICKUPS } from "../data/config/floorPickups";
import {
  CharacterId,
  PauseReason,
  type GameStore,
  type StoreCreator,
  type CoreGameState,
  type GameSlice,
  type UpgradeOption,
  PassiveId,
  FloorPickupId,
  ItemKind,
  WeaponId,
} from "../types";
import { createPlayerStore } from "./playerStore";
import { createEnemiesStore } from "./enemiesStore";
import { createWeaponsStore } from "./weaponsStore";
import { createViewportStore } from "./viewportStore";
import { createXpOrbsStore } from "./xpOrbsStore";
import { createProjectilesStore } from "./projectilesStore";

const INITIAL_GAME_STATE: CoreGameState = {
  isRunning: false,
  isPaused: false,
  pauseReason: PauseReason.None,
  isGameOver: false,
  runTimer: 0,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  pendingLevelUps: 0,
  gold: 0,
  selectedCharacterId: CharacterId.Srulik,
  upgradeChoices: [],
};

const createGameSlice: StoreCreator<GameSlice> = (set, get) => ({
  ...INITIAL_GAME_STATE,

  startGame: (characterId) => {
    const character = CHARACTERS[characterId];
    if (!character) return;

    get().resetPlayer(characterId);
    get().resetWeapons([character.starting_weapon_id]);
    get().resetEnemies();
    get().resetXpOrbs();

    set({
      ...INITIAL_GAME_STATE,
      isRunning: true,
      pauseReason: PauseReason.None,
      selectedCharacterId: characterId,
    });
  },

  pauseGame: () =>
    set((state: GameStore) =>
      state.isRunning
        ? { isPaused: true, pauseReason: PauseReason.Manual }
        : state
    ),
  resumeGame: () =>
    set((state: GameStore) =>
      state.isRunning
        ? { isPaused: false, pauseReason: PauseReason.None }
        : state
    ),
  togglePause: () =>
    set((state: GameStore) => {
      if (!state.isRunning || state.isGameOver) return state;
      const shouldPause = !state.isPaused;
      return {
        isPaused: shouldPause,
        pauseReason: shouldPause ? PauseReason.Manual : PauseReason.None,
      };
    }),
  endGame: () =>
    set({
      isRunning: false,
      isGameOver: true,
      isPaused: false,
      pauseReason: PauseReason.None,
    }),

  updateTimer: (delta) => {
    const { isRunning, isPaused, runTimer } = get();
    if (isRunning && !isPaused) {
      set({ runTimer: runTimer + delta });
    }
  },

  addXp: (amount) => {
    const state = get();
    const progression = resolveLevelProgression({
      level: state.level,
      xp: state.xp,
      nextLevelXp: state.nextLevelXp,
      gainedXp: amount,
    });

    if (progression.levelsGained === 0) {
      set({ xp: progression.xp });
      return;
    }

    const upgradeChoices = buildUpgradeChoices(state);
    if (upgradeChoices.length === 0) {
      set({
        level: progression.level,
        xp: progression.xp,
        nextLevelXp: progression.nextLevelXp,
        pendingLevelUps: 0,
      });
      return;
    }

    set({
      level: progression.level,
      xp: progression.xp,
      nextLevelXp: progression.nextLevelXp,
      pendingLevelUps: state.pendingLevelUps + progression.levelsGained - 1,
      isPaused: true,
      pauseReason: PauseReason.LevelUp,
      upgradeChoices,
    });
  },

  levelUp: () => {
    const state = get();
    const upgradeChoices = buildUpgradeChoices(state);
    const nextLevelXp = Math.floor(state.nextLevelXp * 1.2);

    if (upgradeChoices.length === 0) {
      set({
        level: state.level + 1,
        xp: 0,
        nextLevelXp,
        pendingLevelUps: 0,
      });
      return;
    }

    set({
      level: state.level + 1,
      xp: 0,
      nextLevelXp,
      pendingLevelUps: state.pendingLevelUps,
      isPaused: true,
      pauseReason: PauseReason.LevelUp,
      upgradeChoices,
    });
  },

  addGold: (amount) => {
    set((state: GameStore) => ({ gold: state.gold + amount }));
  },

  applyUpgrade: (choice: UpgradeOption) => {
    if (choice.kind === ItemKind.Weapon) {
      const { weaponId, isNew, evolvesFrom } = choice;
      if (evolvesFrom) {
        set((state: GameStore) => {
          const nextWeapons = [
            ...state.activeWeapons.filter((id: WeaponId) => id !== evolvesFrom),
            weaponId,
          ];
          const nextWeaponLevels = { ...state.weaponLevels, [weaponId]: 1 };
          delete nextWeaponLevels[evolvesFrom];

          return {
            activeWeapons: nextWeapons,
            weaponLevels: nextWeaponLevels,
          };
        });
      } else if (isNew) {
        get().addWeapon(weaponId);
      } else {
        get().levelUpWeapon(weaponId);
      }
    }

    if (choice.kind === ItemKind.Passive) {
      const { passiveId, isNew } = choice;
      if (isNew) {
        get().addPassive(passiveId);
      } else {
        get().levelUpPassive(passiveId);
      }
    }

    const nextState = get();
    if (nextState.pendingLevelUps > 0) {
      const upgradeChoices = buildUpgradeChoices(nextState);
      if (upgradeChoices.length === 0) {
        get().resumeFromLevelUp();
        return;
      }

      set({
        pendingLevelUps: nextState.pendingLevelUps - 1,
        isPaused: true,
        pauseReason: PauseReason.LevelUp,
        upgradeChoices,
      });
      return;
    }

    get().resumeFromLevelUp();
  },

  resumeFromLevelUp: () =>
    set({
      isPaused: false,
      pauseReason: PauseReason.None,
      pendingLevelUps: 0,
      upgradeChoices: [],
    }),

  collectPickup: (pickupId: FloorPickupId) => {
    const pickup = FLOOR_PICKUPS[pickupId];
    if (!pickup) return;

    if (pickup.healAmount) {
      get().heal(pickup.healAmount);
    }
  },
});

const useGameStore = create<GameStore>()((...args) => ({
  ...createGameSlice(...args),
  ...createPlayerStore(...args),
  ...createEnemiesStore(...args),
  ...createWeaponsStore(...args),
  ...createViewportStore(...args),
  ...createXpOrbsStore(...args),
  ...createProjectilesStore(...args),
}));

export { useGameStore };

const BASE_WEAPON_POOL: WeaponId[] = [
  WeaponId.Sabra,
  WeaponId.KeterChairs,
  WeaponId.Kaparot,
  WeaponId.Pitas,
  WeaponId.StarOfDavid,
];

type UpgradeChoiceState = Pick<
  GameStore,
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

export const collectUpgradeChoices = (state: UpgradeChoiceState): UpgradeOption[] => {
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
    }
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
        })
      );
  }

  return choices;
};

export const buildUpgradeChoices = (state: UpgradeChoiceState): UpgradeOption[] => {
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
