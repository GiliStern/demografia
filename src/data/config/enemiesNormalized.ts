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
import { createNormalizedAccessor } from "../createNormalizedAccessor";

export const getEnemy = createNormalizedAccessor(
  ENEMIES,
  normalizeEnemyData
) as (id: EnemyId) => EnemyDataRuntime | undefined;
