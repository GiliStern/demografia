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
