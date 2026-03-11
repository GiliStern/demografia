import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useViewportStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSessionStore } from "@/store/sessionStore";
import { getEnemyManager } from "@/simulation/enemyManager";
import { getEnemy } from "@/data/config/enemiesNormalized";
import { WaveId } from "@/data/config/waves";
import { getNormalizedWaves } from "@/data/config/wavesNormalized";
import type { SpawnTracker } from "@/types/hooks/game";
import { getSpawnPositionOutsideViewport } from "@/utils/rendering/viewportBounds";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";
import {
  findCurrentWave,
  getEnemyTypesToSpawn,
} from "@/utils/game/wavePlanning";

const DEFAULT_STAGE = WaveId.TelAviv;

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/**
 * Wave spawn hook - drives EnemyManager directly.
 * No React state for enemies; spawn logic runs in useFrame.
 */
export function useWaveManager(): void {
  const spawnTrackerRef = useRef<SpawnTracker>({});

  const runTimer = useSessionStore((state) => state.runTimer);
  const playerPosition = usePlayerStore((state) => state.playerPosition);
  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);
  const viewportBounds = useViewportStore((state) => state.viewportBounds);

  const enemyManager = getEnemyManager();

  useFrame(() => {
    if (isPaused || !isRunning || !viewportBounds) return;

    const stageWaves = getNormalizedWaves(DEFAULT_STAGE);
    const currentWave = findCurrentWave(stageWaves, runTimer);
    if (!currentWave) return;

    const snapshot = enemyManager.getSnapshot();
    const enemiesForPlanning = snapshot.map((e) => ({
      id: e.id,
      typeId: e.typeId,
      position: [e.position.x, e.position.y, 0] as [number, number, number],
    }));

    const toSpawn = getEnemyTypesToSpawn(
      currentWave,
      enemiesForPlanning,
      spawnTrackerRef.current,
      runTimer,
    );

    for (const typeId of toSpawn) {
      const enemyData = getEnemy(typeId);
      if (!enemyData) continue;

      const spawnPos = getSpawnPositionOutsideViewport(
        playerPosition,
        viewportBounds,
        VIEWPORT_CONFIG.ENEMY_SPAWN_MARGIN,
      );

      const id = generateId();
      enemyManager.spawnEnemy(id, typeId, spawnPos, enemyData);
      spawnTrackerRef.current[typeId] = { lastSpawn: runTimer };
    }
  });
}
