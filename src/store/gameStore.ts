import { create } from "zustand";
import { CHARACTERS } from "../data/config/characters";
import {
  CharacterId,
  PauseReason,
  type GameStore,
  type StoreCreator,
  type CoreGameState,
  type GameSlice,
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
    set({
      level: level + 1,
      xp: xp - nextLevelXp,
      nextLevelXp: Math.floor(nextLevelXp * 1.2), // Simple exponential curve
      isPaused: true, // Pause for selection screen
      pauseReason: PauseReason.LevelUp,
    });
  },

  addGold: (amount) => {
    set((state) => ({ gold: state.gold + amount }));
  },
});

export const useGameStore = create<GameStore>()((...args) => ({
  ...createGameSlice(...args),
  ...createPlayerStore(...args),
  ...createEnemiesStore(...args),
  ...createWeaponsStore(...args),
}));
