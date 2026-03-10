import type { CentralizedProjectile, ViewportBounds } from "@/types";
import type { EnemyPositionMap } from "@/utils/game/waveUtils";
import type { TickContext } from "@/simulation/projectileManager";
import { useGameStore } from "./gameStore";

/**
 * Frame-system adapters: isolate imperative store access for simulation hot paths.
 * All getState() usage for frame-driven systems goes through these named helpers.
 */

export const getPlayerPositionSnapshot = (): { x: number; y: number } =>
  useGameStore.getState().playerPosition;

export const getPlayerDirectionSnapshot = (): { x: number; y: number } =>
  useGameStore.getState().playerDirection;

export const getViewportBoundsSnapshot = (): ViewportBounds | null =>
  useGameStore.getState().viewportBounds;

export const getEnemyPositionsRegistrySnapshot = (): EnemyPositionMap =>
  useGameStore.getState().enemyPositionsRegistry as EnemyPositionMap;

export const getProjectilesSnapshot = (): CentralizedProjectile[] =>
  useGameStore.getState().getProjectilesArray();

/** Builds tick context for projectile manager; single getState() per frame. */
export const getProjectileTickContext = (): TickContext => {
  const store = useGameStore.getState();
  return {
    getEnemyPositions: () => store.enemyPositionsRegistry as EnemyPositionMap,
    getViewportBounds: () => store.viewportBounds,
    getPlayerPosition: () => store.playerPosition,
    damageEnemy: (id, damage) => store.damageEnemy(id, damage),
  };
};
