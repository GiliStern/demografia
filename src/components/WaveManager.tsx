import { useWaveManager } from "../hooks/game/useWaveManager";

// Re-export for backward compatibility
export type { ActiveEnemy } from "../types/hooks/game";

/**
 * WaveManager - Runs wave spawn logic only.
 * Enemy rendering is handled by BatchedEnemyRenderer.
 */
export const WaveManager = () => {
  useWaveManager();
  return null;
};
