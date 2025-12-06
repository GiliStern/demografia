import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, ProjectileWeaponInstance } from "../types";
import { WEAPONS } from "../data/config/weaponsConfig";
import { useGameStore } from "./useGameStore";
import { resolveDirection } from "../utils/weaponUtils";
import { nearestEnemyDirection } from "../utils/weaponMath";
import { WeaponId } from "@/types";
import { buildWeaponRuntime, shouldFire } from "@/utils/weaponLifecycle";
import {
  buildVelocity,
  createSpreadProjectiles,
} from "@/utils/weaponProjectiles";

interface ProjectileWeaponHookParams {
  weaponId: WeaponId;
}

export function useNearestProjectileWeapon({
  weaponId,
}: ProjectileWeaponHookParams): ProjectileWeaponInstance {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const lastFireTime = useRef(0);
  const {
    playerPosition,
    playerDirection,
    playerStats,
    isPaused,
    isRunning,
    getWeaponStats,
    enemiesPositions,
  } = useGameStore();

  const weaponData = WEAPONS[weaponId];
  const spriteConfig = weaponData?.sprite_config;
  const stats = getWeaponStats(weaponId);
  const runtime = buildWeaponRuntime(stats, playerStats);

  const fire = (time: number) => {
    lastFireTime.current = time;

    const targetDir =
      nearestEnemyDirection(playerPosition, enemiesPositions) ??
      resolveDirection(playerDirection.x, playerDirection.y);

    const baseVelocity = buildVelocity(targetDir, runtime.speed);

    const newShots = createSpreadProjectiles({
      amount: runtime.amount || 1,
      baseVelocity,
      spreadStep: 0,
      position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
      duration: runtime.duration,
      damage: runtime.damage,
      idFactory: () => Math.random().toString(),
    });

    setProjectiles((prev: ProjectileData[]) => [...prev, ...newShots]);
  };

  const removeProjectile = (id: string) => {
    setProjectiles((prev: ProjectileData[]) => prev.filter((p) => p.id !== id));
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;

    const time = state.clock.getElapsedTime();
    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time);
    }
  });

  return {
    projectiles,
    spriteConfig,
    damage: runtime.damage,
    removeProjectile,
    cooldown: runtime.cooldown,
    speed: runtime.speed,
    duration: runtime.duration,
    shouldSpin: weaponData.shouldSpin,
  };
}
