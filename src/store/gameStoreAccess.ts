import type { CentralizedProjectile, ViewportBounds } from "@/types";
import type { EnemyPositionMap } from "@/utils/game/waveUtils";
import type { TickContext } from "@/simulation/projectileManager";
import { getGameplayContext } from "@/simulation/gameplayContext";
import { useGameStore } from "./gameStore";

/**
 * Frame-system adapters: isolate imperative store access for simulation hot paths.
 * All getState() usage for frame-driven systems goes through GameplayContext.
 * These helpers delegate to getGameplayContext() for consistency.
 */

export const getPlayerPositionSnapshot = (): { x: number; y: number } =>
  getGameplayContext().getPlayerPosition();

export const getPlayerDirectionSnapshot = (): { x: number; y: number } =>
  getGameplayContext().getPlayerDirection();

export const getViewportBoundsSnapshot = (): ViewportBounds | null =>
  getGameplayContext().getViewportBounds();

export const getEnemyPositionsRegistrySnapshot = (): EnemyPositionMap =>
  getGameplayContext().getEnemyPositions();

export const getProjectilesSnapshot = (): CentralizedProjectile[] =>
  useGameStore.getState().getProjectilesArray();

/** Builds tick context for projectile manager; delegates to GameplayContext. */
export const getProjectileTickContext = (): TickContext =>
  getGameplayContext().getProjectileTickContext();
