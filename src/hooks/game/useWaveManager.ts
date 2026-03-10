import { useState, useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useViewportStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSessionStore } from "@/store/sessionStore";
import { getEnemyPositionsRegistrySnapshot } from "@/store/gameStoreAccess";
import { WaveId } from "@/data/config/waves";
import { getNormalizedWaves } from "@/data/config/wavesNormalized";
import type { EnemyId } from "@/types";
import type {
  ActiveEnemy,
  SpawnTracker,
  UseWaveManagerReturn,
} from "@/types/hooks/game";
import {
  getSpawnPositionOutsideViewport,
  getCullDistance,
} from "@/utils/rendering/viewportBounds";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";
import { filterEnemiesWithinCullDistance } from "@/utils/game/waveUtils";
import {
  findCurrentWave,
  getEnemyTypesToSpawn,
} from "@/utils/game/wavePlanning";

// Re-export for components
export type { ActiveEnemy };

const DEFAULT_STAGE = WaveId.TelAviv;
const CULL_INTERVAL = 0.25; // seconds, ~4 Hz

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/**
 * Custom hook for wave management - handles enemy spawning, culling, and tracking.
 * Uses pure wave planning helpers for spawn decisions.
 */
export function useWaveManager(): UseWaveManagerReturn {
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const spawnTrackerRef = useRef<SpawnTracker>({});
  const lastCullTimeRef = useRef(0);

  const runTimer = useSessionStore((state) => state.runTimer);
  const playerPosition = usePlayerStore((state) => state.playerPosition);
  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);
  const viewportBounds = useViewportStore((state) => state.viewportBounds);

  const currentWave = useMemo(() => {
    const stageWaves = getNormalizedWaves(DEFAULT_STAGE);
    return findCurrentWave(stageWaves, runTimer);
  }, [runTimer]);

  const spawnEnemy = useCallback(
    (typeId: EnemyId) => {
      if (!viewportBounds) return;

      const spawnPos = getSpawnPositionOutsideViewport(
        playerPosition,
        viewportBounds,
        VIEWPORT_CONFIG.ENEMY_SPAWN_MARGIN
      );

      const newEnemy: ActiveEnemy = {
        id: generateId(),
        typeId,
        position: [spawnPos.x, spawnPos.y, 0],
      };

      setEnemies((prev) => [...prev, newEnemy]);
    },
    [playerPosition, viewportBounds]
  );

  const removeEnemy = useCallback((id: string) => {
    setEnemies((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useFrame(() => {
    if (isPaused || !isRunning || !currentWave) return;

    const now = performance.now() / 1000;
    if (viewportBounds && now - lastCullTimeRef.current >= CULL_INTERVAL) {
      lastCullTimeRef.current = now;
      const cullDistance = getCullDistance(
        viewportBounds,
        VIEWPORT_CONFIG.ENEMY_CULL_MULTIPLIER
      );

      setEnemies((prev) => {
        const enemyPositions = getEnemyPositionsRegistrySnapshot();
        return filterEnemiesWithinCullDistance(
          prev,
          enemyPositions,
          playerPosition,
          cullDistance
        );
      });
    }

    const toSpawn = getEnemyTypesToSpawn(
      currentWave,
      enemies,
      spawnTrackerRef.current,
      runTimer
    );

    for (const typeId of toSpawn) {
      spawnEnemy(typeId);
      spawnTrackerRef.current[typeId] = { lastSpawn: runTimer };
    }
  });

  return {
    enemies,
    removeEnemy,
  };
}
