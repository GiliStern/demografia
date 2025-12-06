import { create } from "zustand";
import {
  CharacterId,
  PauseReason,
  type GameState,
  type PlayerStats,
} from "../types";
import { CHARACTERS } from "../data/config/characters";

interface GameStore extends GameState {
  // Actions
  startGame: (characterId: CharacterId) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  endGame: () => void;
  updateTimer: (delta: number) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  addKill: () => void;
  levelUp: () => void;

  // Player State (Runtime)
  currentHealth: number;
  playerStats: PlayerStats;
  playerPosition: { x: number; y: number };
  playerDirection: { x: number; y: number };
  setPlayerPosition: (x: number, y: number) => void;
  setPlayerDirection: (x: number, y: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
}

const INITIAL_STATE: GameState = {
  isRunning: false,
  isPaused: false,
  pauseReason: PauseReason.None,
  isGameOver: false,
  runTimer: 0,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  gold: 0,
  killCount: 0,
  selectedCharacterId: CharacterId.Srulik,
  activeWeapons: [],
  activeItems: [],
};

const INITIAL_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  moveSpeed: 5,
  might: 1,
  area: 1,
  cooldown: 1,
  recovery: 0,
  luck: 1,
  growth: 1,
  greed: 1,
  curse: 1,
  revivals: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  currentHealth: 100,
  playerStats: INITIAL_PLAYER_STATS,
  playerPosition: { x: 0, y: 0 },
  playerDirection: { x: 1, y: 0 },

  startGame: (characterId: CharacterId) => {
    const character = CHARACTERS[characterId];
    if (!character) return;

    set({
      ...INITIAL_STATE,
      isRunning: true,
      pauseReason: PauseReason.None,
      selectedCharacterId: characterId,
      playerStats: { ...character.stats },
      currentHealth: character.stats.maxHealth,
      activeWeapons: [character.starting_weapon_id],
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
      state.isRunning ? { isPaused: false, pauseReason: PauseReason.None } : state
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

  updateTimer: (delta: number) => {
    const { isRunning, isPaused, runTimer } = get();
    if (isRunning && !isPaused) {
      set({ runTimer: runTimer + delta });
    }
  },

  addXp: (amount: number) => {
    const { xp, nextLevelXp } = get(); // access growth from stats later
    // TODO: Apply growth multiplier
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

  addGold: (amount: number) => {
    set((state) => ({ gold: state.gold + amount }));
  },

  addKill: () => {
    set((state) => ({ killCount: state.killCount + 1 }));
  },

  setPlayerPosition: (x: number, y: number) =>
    set({ playerPosition: { x, y } }),
  setPlayerDirection: (x: number, y: number) =>
    set({ playerDirection: { x, y } }),

  takeDamage: (amount: number) => {
    set((state) => {
      const newHealth = Math.max(0, state.currentHealth - amount);
      if (newHealth === 0) {
        state.endGame();
      }
      return { currentHealth: newHealth };
    });
  },

  heal: (amount: number) => {
    set((state) => ({
      currentHealth: Math.min(
        state.playerStats.maxHealth,
        state.currentHealth + amount
      ),
    }));
  },
}));
