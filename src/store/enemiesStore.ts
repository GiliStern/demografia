import type { StoreCreator, EnemiesStore } from "../types";

export const createEnemiesStore: StoreCreator<EnemiesStore> = (set, get) => ({
  killCount: 0,
  enemiesPositions: {},
  enemyDamageCallbacks: new Map(),

  resetEnemies: () => set({ killCount: 0, enemiesPositions: {}, enemyDamageCallbacks: new Map() }),
  addKill: () =>
    set((state: EnemiesStore) => ({ killCount: state.killCount + 1 })),

  registerEnemy: (id, position) =>
    set((state: EnemiesStore) => ({
      enemiesPositions: { ...state.enemiesPositions, [id]: position },
    })),

  updateEnemyPosition: (id, position) =>
    set((state: EnemiesStore) => {
      if (!state.enemiesPositions[id]) return state;
      return {
        enemiesPositions: { ...state.enemiesPositions, [id]: position },
      };
    }),

  removeEnemy: (id) =>
    set((state: EnemiesStore) => {
      if (!state.enemiesPositions[id]) return state;
      const next = { ...state.enemiesPositions };
      delete next[id];
      const callbacks = new Map(state.enemyDamageCallbacks);
      callbacks.delete(id);
      return { enemiesPositions: next, enemyDamageCallbacks: callbacks };
    }),

  registerEnemyDamageCallback: (id, callback) =>
    set((state: EnemiesStore) => {
      const callbacks = new Map(state.enemyDamageCallbacks);
      callbacks.set(id, callback);
      return { enemyDamageCallbacks: callbacks };
    }),

  damageEnemy: (id, damage) => {
    const callback = get().enemyDamageCallbacks.get(id);
    if (callback) {
      callback(damage);
    }
  },
});
