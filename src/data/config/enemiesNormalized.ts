/**
 * Normalized enemy config - camelCase runtime types.
 * Use getEnemy() in gameplay/rendering code instead of raw ENEMIES.
 */

import type { EnemyId } from "@/types";
import { ENEMIES } from "./enemies";
import {
  normalizeEnemyData,
  type EnemyDataRuntime,
} from "../normalizeConfig";

const cache = new Map<EnemyId, EnemyDataRuntime>();

export function getEnemy(id: EnemyId): EnemyDataRuntime | undefined {
  let normalized = cache.get(id);
  if (!normalized) {
    const raw = ENEMIES[id];
    if (!raw) return undefined;
    normalized = normalizeEnemyData(raw);
    cache.set(id, normalized);
  }
  return normalized;
}
