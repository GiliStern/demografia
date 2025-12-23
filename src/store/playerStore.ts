import { CHARACTERS, INITIAL_PLAYER_STATS } from "../data/config/characters";
import type { StoreCreator, PlayerStore, PlayerStats } from "../types";
import { applyPassivesToPlayerStats } from "../utils/passives/passiveUtils";

export const createPlayerStore: StoreCreator<PlayerStore> = (set, get) => ({
  currentHealth: INITIAL_PLAYER_STATS.maxHealth,
  playerStats: INITIAL_PLAYER_STATS,
  playerPosition: { x: 0, y: 0 },
  playerDirection: { x: 1, y: 0 },

  setPlayerPosition: ({ x, y }) => set({ playerPosition: { x, y } }),
  setPlayerDirection: ({ x, y }) => set({ playerDirection: { x, y } }),

  resetPlayer: (characterId) => {
    const character = CHARACTERS[characterId];
    if (!character) return;

    set({
      playerStats: { ...character.stats },
      currentHealth: character.stats.maxHealth,
      playerPosition: { x: 0, y: 0 },
      playerDirection: { x: 1, y: 0 },
    });
  },

  takeDamage: (amount) => {
    // Apply armor reduction from effective stats
    const effectiveStats = get().getEffectivePlayerStats();
    const reducedDamage = Math.max(1, amount - effectiveStats.armor);
    const newHealth = Math.max(0, get().currentHealth - reducedDamage);
    set({ currentHealth: newHealth });

    if (newHealth === 0) {
      get().endGame();
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
    const baseStats = get().playerStats;
    const passiveEffects = get().getAccumulatedPassiveEffects();
    return applyPassivesToPlayerStats(baseStats, passiveEffects);
  },
});
