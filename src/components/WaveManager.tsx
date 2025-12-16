import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Enemy } from "./Enemy";
import { useGameStore } from "../hooks/useGameStore";
import { WAVES } from "../data/config/waves";
import type { WaveData, EnemyId } from "../types";
import {
  getSpawnPositionOutsideViewport,
  getCullDistance,
} from "../utils/viewportBounds";
import { VIEWPORT_CONFIG } from "../data/config/viewportConfig";
import { distance } from "../utils/weaponMath";

interface ActiveEnemy {
  id: string;
  typeId: EnemyId;
  position: [number, number, number];
}

type SpawnTracker = Record<
  string,
  {
    lastSpawn: number;
  }
>;

const waves = WAVES;
const DEFAULT_STAGE = "stage_1";

export const WaveManager = () => {
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const spawnTrackerRef = useRef<SpawnTracker>({});
  const { runTimer, playerPosition, isPaused, isRunning, addKill } =
    useGameStore();

  const currentWave: WaveData | undefined = useMemo(() => {
    const stageWaves = waves[DEFAULT_STAGE] ?? [];
    return stageWaves.find(
      (w) => runTimer >= w.time_start && runTimer < w.time_end
    );
  }, [runTimer]);

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

      setEnemies((prev) =>
        prev.filter((enemy) => {
          const dist = distance(
            { x: enemy.position[0], y: enemy.position[1] },
            playerPosition
          );
          return dist <= cullDistance;
        })
      );
    }

    currentWave.enemies.forEach((config) => {
      const tracker = spawnTrackerRef.current[config.id] ?? { lastSpawn: 0 };

      // Count current active of this type
      const activeOfType = enemies.filter((e) => e.typeId === config.id).length;
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

  const spawnEnemy = (typeId: EnemyId) => {
    // Get viewport bounds for spawning outside visible frame
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
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeEnemy = (id: string, rewardGold = 1, rewardXp = 10) => {
    setEnemies((prev) => prev.filter((e) => e.id !== id));
    addKill();
    // TODO: connect rewards to store when XP/Gold drop entities exist
  };

  return (
    <>
      {enemies.map((e) => (
        <Enemy key={e.id} {...e} onDeath={() => removeEnemy(e.id)} />
      ))}
    </>
  );
};
