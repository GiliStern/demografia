import { create } from "zustand";
import { CHARACTERS, INITIAL_PLAYER_STATS } from "../data/config/characters";
import type { PlayerStore, PlayerStats } from "../types";
import { applyPassivesToPlayerStats } from "../utils/passives/passiveUtils";
import { useWeaponsStore } from "./weaponsStore";
import { useSessionStore } from "./sessionStore";

let cachedStats: PlayerStats | null = null;
let cacheValid = false;

// Invalidate cache when passives change
useWeaponsStore.subscribe((state, prevState) => {
  if (
    state.activeItems !== prevState.activeItems ||
    state.passiveLevels !== prevState.passiveLevels
  ) {
    cacheValid = false;
  }
});

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  currentHealth: INITIAL_PLAYER_STATS.maxHealth,
  playerStats: INITIAL_PLAYER_STATS,
  playerPosition: { x: 0, y: 0 },
  playerDirection: { x: 1, y: 0 },

  setPlayerPosition: ({ x, y }) => set({ playerPosition: { x, y } }),
  setPlayerDirection: ({ x, y }) => set({ playerDirection: { x, y } }),

  resetPlayer: (characterId) => {
    const character = CHARACTERS[characterId];
    if (!character) return;

    cacheValid = false;
    set({
      playerStats: { ...character.stats },
      currentHealth: character.stats.maxHealth,
      playerPosition: { x: 0, y: 0 },
      playerDirection: { x: 1, y: 0 },
    });
  },

  takeDamage: (amount) => {
    const effectiveStats = get().getEffectivePlayerStats();
    const reducedDamage = Math.max(1, amount - effectiveStats.armor);
    const newHealth = Math.max(0, get().currentHealth - reducedDamage);
    set({ currentHealth: newHealth });

    if (newHealth === 0) {
      useSessionStore.getState().endGame();
    }

    return newHealth;
  },

  heal: (amount) =>
    set((state: PlayerStore) => {
      const effectiveStats = get().getEffectivePlayerStats();
      return {
        currentHealth: Math.min(
          effectiveStats.maxHealth,
          state.currentHealth + amount
        ),
      };
    }),

  getEffectivePlayerStats: (): PlayerStats => {
    if (cacheValid && cachedStats) return cachedStats;
    const baseStats = get().playerStats;
    const passiveEffects = useWeaponsStore.getState().getAccumulatedPassiveEffects();
    cachedStats = applyPassivesToPlayerStats(baseStats, passiveEffects);
    cacheValid = true;
    return cachedStats;
  },
}));
