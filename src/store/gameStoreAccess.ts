import type { CentralizedProjectile, ViewportBounds } from "@/types";
import type { EnemyPositionMap } from "@/utils/game/waveUtils";
import type { TickContext } from "@/simulation/projectileManager";
import { useGameStore } from "./gameStore";
import { usePlayerStore } from "./playerStore";
import { enemyManager } from "../simulation/enemyManager";

/**
 * Frame-system adapters: isolate imperative store access for simulation hot paths.
 * All getState() usage for frame-driven systems goes through these named helpers.
 */

export const getPlayerPositionSnapshot = (): { x: number; y: number } =>
  usePlayerStore.getState().playerPosition;

export const getPlayerDirectionSnapshot = (): { x: number; y: number } =>
  usePlayerStore.getState().playerDirection;

export const getViewportBoundsSnapshot = (): ViewportBounds | null =>
  useGameStore.getState().viewportBounds;

export const getEnemyPositionsRegistrySnapshot = (): EnemyPositionMap =>
  enemyManager.getEnemyPositions() as EnemyPositionMap;

export const getProjectilesSnapshot = (): CentralizedProjectile[] =>
  useGameStore.getState().getProjectilesArray();

/** Builds tick context for projectile manager; single getState() per frame. */
export const getProjectileTickContext = (): TickContext => {
  const gameStore = useGameStore.getState();
  const playerStore = usePlayerStore.getState();
  return {
    getEnemyPositions: () =>
      enemyManager.getEnemyPositions() as EnemyPositionMap,
    getViewportBounds: () => gameStore.viewportBounds,
    getPlayerPosition: () => playerStore.playerPosition,
    damageEnemy: (id, damage) => enemyManager.damageEnemy(id, damage),
  };
};
