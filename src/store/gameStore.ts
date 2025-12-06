import { create } from "zustand";
import { CHARACTERS } from "../data/config/characters";
import { WEAPONS } from "../data/config/weapons";
import { PASSIVES } from "../data/config/passives";
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

const INITIAL_GAME_STATE: CoreGameState = {
  isRunning: false,
  isPaused: false,
  pauseReason: PauseReason.None,
  isGameOver: false,
  runTimer: 0,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
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

    set({
      ...INITIAL_GAME_STATE,
      isRunning: true,
      pauseReason: PauseReason.None,
      selectedCharacterId: characterId,
    });
  },

  pauseGame: () =>
    set((state) =>
      state.isRunning
        ? { isPaused: true, pauseReason: PauseReason.Manual }
        : state
    ),
  resumeGame: () =>
    set((state) =>
      state.isRunning
        ? { isPaused: false, pauseReason: PauseReason.None }
        : state
    ),
  togglePause: () =>
    set((state) => {
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
    const { xp, nextLevelXp } = get(); // access growth from stats later
    const newXp = xp + amount;
    if (newXp >= nextLevelXp) {
      get().levelUp();
    } else {
      set({ xp: newXp });
    }
  },

  levelUp: () => {
    const { level, nextLevelXp, xp } = get();
    const upgradeChoices = buildUpgradeChoices(get);
    set({
      level: level + 1,
      xp: xp - nextLevelXp,
      nextLevelXp: Math.floor(nextLevelXp * 1.2), // Simple exponential curve
      isPaused: true, // Pause for selection screen
      pauseReason: PauseReason.LevelUp,
      upgradeChoices,
    });
  },

  addGold: (amount) => {
    set((state) => ({ gold: state.gold + amount }));
  },

  applyUpgrade: (choice: UpgradeOption) => {
    if (choice.kind === ItemKind.Weapon) {
      const { weaponId, isNew } = choice;
      if (isNew) {
        get().addWeapon(weaponId);
      } else {
        get().levelUpWeapon(weaponId);
        // Handle evolution swap if reached max level and passive present
        const def = WEAPONS[weaponId];
        const max = def.maxLevel ?? 1;
        const currentLevel = get().weaponLevels[weaponId] ?? 1;
        if (
          def.evolution &&
          currentLevel >= max &&
          get().activeItems.includes(def.evolution.passiveRequired)
        ) {
          set((state) => {
            const evolvedId = def.evolution?.evolvesTo;
            if (!evolvedId) return state;

            const nextWeapons = [
              ...state.activeWeapons.filter((id) => id !== weaponId),
              evolvedId,
            ];
            const nextWeaponLevels = { ...state.weaponLevels, [evolvedId]: 1 };
            delete nextWeaponLevels[weaponId];

            return {
              activeWeapons: nextWeapons,
              weaponLevels: nextWeaponLevels,
            };
          });
        }
      }
    }

    if (choice.kind === ItemKind.Passive) {
      get().addPassive(choice.passiveId);
    }

    get().resumeFromLevelUp();
  },

  resumeFromLevelUp: () =>
    set({
      isPaused: false,
      pauseReason: PauseReason.None,
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

export const useGameStore = create<GameStore>()((...args) => ({
  ...createGameSlice(...args),
  ...createPlayerStore(...args),
  ...createEnemiesStore(...args),
  ...createWeaponsStore(...args),
}));

const BASE_WEAPON_POOL: WeaponId[] = [
  WeaponId.Sabra,
  WeaponId.KeterChairs,
  WeaponId.Kaparot,
  WeaponId.Pitas,
  WeaponId.StarOfDavid,
];

const buildUpgradeChoices = (get: () => GameStore): UpgradeOption[] => {
  const state = get();
  const choices: UpgradeOption[] = [];

  // Upgradable existing weapons
  state.activeWeapons.forEach((weaponId) => {
    const def = WEAPONS[weaponId];
    const level = state.weaponLevels[weaponId] ?? 1;
    const max = def?.maxLevel ?? level;
    if (def && level < max) {
      choices.push({ kind: ItemKind.Weapon, weaponId, isNew: false });
    } else if (
      def?.evolution &&
      state.activeItems.includes(def.evolution.passiveRequired)
    ) {
      choices.push({
        kind: ItemKind.Weapon,
        weaponId: def.evolution.evolvesTo,
        isNew: true,
      });
    }
  });

  // New weapons
  BASE_WEAPON_POOL.filter((id) => !state.activeWeapons.includes(id)).forEach(
    (weaponId) => {
      choices.push({ kind: ItemKind.Weapon, weaponId, isNew: true });
    }
  );

  // Passives
  (Object.keys(PASSIVES) as PassiveId[])
    .filter((id) => !state.activeItems.includes(id))
    .forEach((passiveId) =>
      choices.push({ kind: ItemKind.Passive, passiveId, isNew: true })
    );

  return choices.slice(0, 3);
};
