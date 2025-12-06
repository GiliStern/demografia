import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Enemy } from "./Enemy";
import { useGameStore } from "../store/gameStore";
import { WAVES } from "../data/config/waves";
import type { WaveData, EnemyId } from "../types";

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
const SPAWN_DISTANCE = 20;

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
    const angle = Math.random() * Math.PI * 2;
    const distance = SPAWN_DISTANCE;
    const x = playerPosition.x + Math.cos(angle) * distance;
    const y = playerPosition.y + Math.sin(angle) * distance;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const newEnemy: ActiveEnemy = {
      id,
      typeId,
      position: [x, y, 0],
    };

    setEnemies((prev) => [...prev, newEnemy]);
  };

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
