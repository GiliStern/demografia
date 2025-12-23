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

export interface UseWaveManagerReturn {
  enemies: ActiveEnemy[];
  removeEnemy: (id: string, rewardGold?: number, rewardXp?: number) => void;
}

