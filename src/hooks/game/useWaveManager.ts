import { useState, useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { WaveId, WAVES } from "@/data/config/waves";
import type { WaveData, EnemyId } from "@/types";
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
import {
  countActiveEnemiesOfType,
  filterEnemiesWithinCullDistance,
} from "@/utils/game/waveUtils";

// Re-export for components
export type { ActiveEnemy };

const waves = WAVES;
const DEFAULT_STAGE = WaveId.TelAviv;

/**
 * Custom hook for wave management - handles enemy spawning, culling, and tracking
 */
export function useWaveManager(): UseWaveManagerReturn {
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const spawnTrackerRef = useRef<SpawnTracker>({});

  // Zustand selectors
  const { runTimer, playerPosition, isPaused, isRunning } = useGameStore();

  // Determine current wave based on run timer
  const currentWave: WaveData | undefined = useMemo(() => {
    const stageWaves = waves[DEFAULT_STAGE] ?? [];
    return stageWaves.find(
      (w) => runTimer >= w.time_start && runTimer < w.time_end
    );
  }, [runTimer]);

  // Spawn enemy at a random position outside viewport
  const spawnEnemy = useCallback(
    (typeId: EnemyId) => {
      const viewportBounds = useGameStore.getState().viewportBounds;
      if (!viewportBounds) return;

      const spawnPos = getSpawnPositionOutsideViewport(
        playerPosition,
        viewportBounds,
        VIEWPORT_CONFIG.ENEMY_SPAWN_MARGIN
      );

      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      const newEnemy: ActiveEnemy = {
        id,
        typeId,
        position: [spawnPos.x, spawnPos.y, 0],
      };

      setEnemies((prev) => [...prev, newEnemy]);
    },
    [playerPosition]
  );

  // Remove enemy from the active wave roster.
  const removeEnemy = useCallback((id: string) => {
    setEnemies((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Handle enemy spawning and culling each frame
  useFrame(() => {
    if (isPaused || !isRunning || !currentWave) return;

    // Get viewport bounds for culling
    const viewportBounds = useGameStore.getState().viewportBounds;
    if (viewportBounds) {
      // Cull enemies that are too far from player (Vampire Survivors style)
      const cullDistance = getCullDistance(
        viewportBounds,
        VIEWPORT_CONFIG.ENEMY_CULL_MULTIPLIER
      );

      setEnemies((prev) => {
        const enemyPositions = useGameStore.getState().enemiesPositions;
        return filterEnemiesWithinCullDistance(
          prev,
          enemyPositions,
          playerPosition,
          cullDistance
        );
      });
    }

    // Spawn enemies based on wave configuration
    currentWave.enemies.forEach((config) => {
      const tracker = spawnTrackerRef.current[config.id] ?? { lastSpawn: 0 };

      // Count current active of this type
      const activeOfType = countActiveEnemiesOfType(enemies, config.id);
      if (activeOfType >= config.max_active) {
        return;
      }

      const now = runTimer;
      if (now - tracker.lastSpawn >= config.spawn_interval) {
        spawnEnemy(config.id);
        spawnTrackerRef.current[config.id] = { lastSpawn: now };
      }
    });
  });

  return {
    enemies,
    removeEnemy,
  };
}
