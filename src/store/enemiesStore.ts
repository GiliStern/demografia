import type { StoreCreator, EnemiesStore } from "../types";

export const createEnemiesStore: StoreCreator<EnemiesStore> = (set) => {
  const enemyPositions = new Map<string, { x: number; y: number }>();
  const enemyDamageCallbacks = new Map<string, (damage: number) => void>();

  return {
    killCount: 0,
    enemyPositionsRegistry: enemyPositions,

    resetEnemies: () => {
      enemyPositions.clear();
      enemyDamageCallbacks.clear();
      set({ killCount: 0 });
    },
    addKill: () =>
      set((state: EnemiesStore) => ({ killCount: state.killCount + 1 })),

    registerEnemy: (id, position) => {
      enemyPositions.set(id, position);
    },

    updateEnemyPosition: (id, position) => {
      if (!enemyPositions.has(id)) return;
      enemyPositions.set(id, position);
    },

    removeEnemy: (id) => {
      enemyPositions.delete(id);
      enemyDamageCallbacks.delete(id);
    },

    registerEnemyDamageCallback: (id, callback) => {
      enemyDamageCallbacks.set(id, callback);
    },

    damageEnemy: (id, damage) => {
      const callback = enemyDamageCallbacks.get(id);
      if (callback) {
        callback(damage);
      }
    },

    getEnemyPosition: (id) => {
      return enemyPositions.get(id);
    },

    getEnemyPositions: () => {
      return enemyPositions;
    },

    hasEnemy: (id) => {
      return enemyPositions.has(id);
    },
  };
};
