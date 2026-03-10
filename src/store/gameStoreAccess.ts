import type { CentralizedProjectile, ViewportBounds } from "@/types";
import type { EnemyPositionMap } from "@/utils/game/waveUtils";
import { useGameStore } from "./gameStore";

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
