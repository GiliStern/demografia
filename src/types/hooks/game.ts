import type { EnemyId } from "../../types";

// ===========================
// Wave Manager Hook Types
// ===========================

export interface ActiveEnemy {
  id: string;
  typeId: EnemyId;
  position: [number, number, number];
}

export type SpawnTracker = Record<
  string,
  {
    lastSpawn: number;
  }
>;

/** useWaveManager runs spawn logic only; returns nothing. */
export type UseWaveManagerReturn = void;

