/**
 * Enemy Manager
 *
 * Module-level manager for enemy positions and damage callbacks.
 * Similar to projectileManager - keeps mutable state outside Zustand.
 * killCount lives in useSessionStore.
 */

export interface EnemyPosition {
  x: number;
  y: number;
}

const enemyPositions = new Map<string, EnemyPosition>();
const enemyDamageCallbacks = new Map<string, (damage: number) => void>();

export interface EnemyManager {
  registerEnemy(id: string, position: EnemyPosition): void;
  updateEnemyPosition(id: string, position: EnemyPosition): void;
  removeEnemy(id: string): void;
  registerEnemyDamageCallback(id: string, callback: (damage: number) => void): void;
  damageEnemy(id: string, damage: number): void;
  getEnemyPosition(id: string): EnemyPosition | undefined;
  getEnemyPositions(): ReadonlyMap<string, EnemyPosition>;
  hasEnemy(id: string): boolean;
  reset(): void;
}

export const enemyManager: EnemyManager = {
  registerEnemy(id, position) {
    enemyPositions.set(id, position);
  },

  updateEnemyPosition(id, position) {
    if (!enemyPositions.has(id)) return;
    enemyPositions.set(id, position);
  },

  removeEnemy(id) {
    enemyPositions.delete(id);
    enemyDamageCallbacks.delete(id);
  },

  registerEnemyDamageCallback(id, callback) {
    enemyDamageCallbacks.set(id, callback);
  },

  damageEnemy(id, damage) {
    const callback = enemyDamageCallbacks.get(id);
    if (callback) {
      callback(damage);
    }
  },

  getEnemyPosition(id) {
    return enemyPositions.get(id);
  },

  getEnemyPositions() {
    return enemyPositions;
  },

  hasEnemy(id) {
    return enemyPositions.has(id);
  },

  reset() {
    enemyPositions.clear();
    enemyDamageCallbacks.clear();
  },
};
