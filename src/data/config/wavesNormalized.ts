/**
 * Normalized wave config - camelCase runtime types.
 * Use this in gameplay code instead of raw WAVES.
 */

import { WaveId, WAVES } from "./waves";
import { normalizeWaveData, type WaveDataRuntime } from "../normalizeConfig";
import { createNormalizedArrayAccessor } from "../createNormalizedAccessor";

const getRawWaves = (stage: WaveId) => WAVES[stage] ?? [];

export const getNormalizedWaves = createNormalizedArrayAccessor<
  WaveId,
  (typeof WAVES)[WaveId][number],
  WaveDataRuntime
>(getRawWaves, normalizeWaveData);

/**
 * Returns the end time (seconds) of the last wave for a stage.
 * Used to detect when all waves are complete (win condition).
 */
export function getStageLastWaveEndTime(stage: WaveId): number {
  const waves = getNormalizedWaves(stage);
  const last = waves[waves.length - 1];
  return last?.timeEnd ?? 0;
}
