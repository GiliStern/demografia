import type { StoreCreator, EnemiesStore } from "../types";

export const createEnemiesStore: StoreCreator<EnemiesStore> = (set) => ({
  killCount: 0,
  enemiesPositions: {},

  resetEnemies: () => set({ killCount: 0, enemiesPositions: {} }),
  addKill: () => set((state) => ({ killCount: state.killCount + 1 })),

  registerEnemy: (id, position) =>
    set((state) => ({
      enemiesPositions: { ...state.enemiesPositions, [id]: position },
    })),

  updateEnemyPosition: (id, position) =>
    set((state) => {
      if (!state.enemiesPositions[id]) return state;
      return {
        enemiesPositions: { ...state.enemiesPositions, [id]: position },
      };
    }),

  removeEnemy: (id) =>
    set((state) => {
      if (!state.enemiesPositions[id]) return state;
      const next = { ...state.enemiesPositions };
      delete next[id];
      return { enemiesPositions: next };
    }),
});
