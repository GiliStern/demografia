/**
 * Pure wave planning helpers - deterministic, testable, no React or store.
 * Uses normalized (camelCase) wave config.
 */

import type { EnemyId } from "@/types";
import type { ActiveEnemy } from "@/types/hooks/game";
import type {
  WaveDataRuntime,
  WaveEnemyConfigRuntime,
} from "@/data/normalizeConfig";
import { countActiveEnemiesOfType } from "./waveUtils";

export type SpawnTracker = Record<string, { lastSpawn: number }>;

export type { WaveEnemyConfigRuntime };

/**
 * Returns the wave active at the given run timer.
 */
export function findCurrentWave(
  stageWaves: WaveDataRuntime[],
  runTimer: number
): WaveDataRuntime | undefined {
  return stageWaves.find(
    (w) => runTimer >= w.timeStart && runTimer < w.timeEnd
  );
}

/**
 * Determines if an enemy of this type should spawn this frame.
 */
export function shouldSpawnEnemy(
  config: WaveEnemyConfigRuntime,
  activeCount: number,
  lastSpawn: number,
  now: number
): boolean {
  return (
    activeCount < config.maxActive && now - lastSpawn >= config.spawnInterval
  );
}

/**
 * Returns enemy type IDs that should spawn this frame.
 * Caller is responsible for spawning and updating the tracker.
 */
export function getEnemyTypesToSpawn(
  wave: WaveDataRuntime,
  enemies: ActiveEnemy[],
  tracker: SpawnTracker,
  now: number
): EnemyId[] {
  const toSpawn: EnemyId[] = [];

  for (const config of wave.enemies) {
    const lastSpawn = tracker[config.id]?.lastSpawn ?? 0;
    const activeOfType = countActiveEnemiesOfType(enemies, config.id);

    if (shouldSpawnEnemy(config, activeOfType, lastSpawn, now)) {
      toSpawn.push(config.id);
    }
  }

  return toSpawn;
}

/**
 * Updates the spawn tracker after spawning an enemy.
 */
export function recordSpawn(
  tracker: SpawnTracker,
  enemyId: EnemyId,
  now: number
): SpawnTracker {
  return {
    ...tracker,
    [enemyId]: { lastSpawn: now },
  };
}
