import type { EnemyId } from "@/types";
import type { ActiveEnemy } from "@/types/hooks/game";
import { distance } from "@/utils/weapons/weaponMath";

export interface WorldPosition2D {
  x: number;
  y: number;
}

export type EnemyPositionMap =
  | Record<string, WorldPosition2D>
  | ReadonlyMap<string, WorldPosition2D>;

const isEnemyPositionRegistry = (
  enemyPositions: EnemyPositionMap,
): enemyPositions is ReadonlyMap<string, WorldPosition2D> => {
  return enemyPositions instanceof Map;
};

const readEnemyPosition = (
  enemyPositions: EnemyPositionMap,
  enemyId: string,
): WorldPosition2D | undefined => {
  if (isEnemyPositionRegistry(enemyPositions)) {
    return enemyPositions.get(enemyId);
  }

  return Object.prototype.hasOwnProperty.call(enemyPositions, enemyId)
    ? enemyPositions[enemyId]
    : undefined;
};

export const resolveEnemyWorldPosition = (
  enemy: ActiveEnemy,
  enemyPositions: EnemyPositionMap,
): WorldPosition2D => {
  return (
    readEnemyPosition(enemyPositions, enemy.id) ?? {
      x: enemy.position[0],
      y: enemy.position[1],
    }
  );
};

export const shouldKeepEnemyInWave = (
  enemy: ActiveEnemy,
  enemyPositions: EnemyPositionMap,
  playerPosition: WorldPosition2D,
  cullDistance: number,
): boolean => {
  const enemyPosition = resolveEnemyWorldPosition(enemy, enemyPositions);
  return distance(enemyPosition, playerPosition) <= cullDistance;
};

export const filterEnemiesWithinCullDistance = (
  enemies: ActiveEnemy[],
  enemyPositions: EnemyPositionMap,
  playerPosition: WorldPosition2D,
  cullDistance: number,
): ActiveEnemy[] => {
  return enemies.filter((enemy) =>
    shouldKeepEnemyInWave(enemy, enemyPositions, playerPosition, cullDistance),
  );
};

export const countActiveEnemiesOfType = (
  enemies: ActiveEnemy[],
  typeId: EnemyId,
): number => {
  return enemies.filter((enemy) => enemy.typeId === typeId).length;
};
