/**
 * Normalized wave config - camelCase runtime types.
 * Use this in gameplay code instead of raw WAVES.
 */

import { WaveId, WAVES } from "./waves";
import { normalizeWaveData, type WaveDataRuntime } from "../normalizeConfig";

const cache = new Map<string, WaveDataRuntime[]>();

function getCacheKey(stage: WaveId): string {
  return stage;
}

export function getNormalizedWaves(stage: WaveId): WaveDataRuntime[] {
  const key = getCacheKey(stage);
  let normalized = cache.get(key);
  if (!normalized) {
    const rawWaves = WAVES[stage] ?? [];
    normalized = rawWaves.map(normalizeWaveData);
    cache.set(key, normalized);
  }
  return normalized;
}
