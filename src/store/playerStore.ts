import { CHARACTERS, INITIAL_PLAYER_STATS } from "../data/config/characters";
import type { StoreCreator, PlayerStore } from "../types";

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
    const newHealth = Math.max(0, get().currentHealth - amount);
    set({ currentHealth: newHealth });

    if (newHealth === 0) {
      get().endGame();
    }

    return newHealth;
  },

  heal: (amount) =>
    set((state: PlayerStore) => ({
      currentHealth: Math.min(
        state.playerStats.maxHealth,
        state.currentHealth + amount
      ),
    })),
});
