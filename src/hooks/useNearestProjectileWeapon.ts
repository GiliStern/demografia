import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, ProjectileWeaponInstance } from "../types";
import { WEAPONS } from "../data/config/weaponsConfig";
import { useGameStore } from "./useGameStore";
import { resolveDirection } from "../utils/weaponUtils";
import { nearestEnemyDirection } from "../utils/weaponMath";
import { WeaponId } from "@/types";

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
  const stats = weaponData ? getWeaponStats(weaponId) : undefined;
  const damage = (stats?.damage ?? 0) * (playerStats.might || 1);
  const speed = stats?.speed ?? 0;
  const duration = stats?.duration ?? 0;
  const amount = stats?.amount ?? 1;
  const cooldown = stats?.cooldown ?? Number.POSITIVE_INFINITY;

  const fire = (time: number) => {
    lastFireTime.current = time;

    const targetDir =
      nearestEnemyDirection(playerPosition, enemiesPositions) ??
      resolveDirection(playerDirection.x, playerDirection.y);

    const length =
      Math.sqrt(targetDir.x * targetDir.x + targetDir.y * targetDir.y) || 1;
    const baseVX = (targetDir.x / length) * speed;
    const baseVY = (targetDir.y / length) * speed;

    const newShots = Array.from({ length: amount }).map(() => {
      const newProjectile: ProjectileData = {
        id: Math.random().toString(),
        position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
        velocity: { x: baseVX, y: baseVY },
        duration,
        damage,
      };
      return newProjectile;
    });

    setProjectiles((prev: ProjectileData[]) => [...prev, ...newShots]);
  };

  const removeProjectile = (id: string) => {
    setProjectiles((prev: ProjectileData[]) => prev.filter((p) => p.id !== id));
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;

    const time = state.clock.getElapsedTime();
    if (time - lastFireTime.current > cooldown) {
      fire(time);
    }
  });

  return {
    projectiles,
    spriteConfig,
    damage,
    removeProjectile,
    cooldown,
    speed,
    duration,
    shouldSpin: weaponData.shouldSpin,
  };
}

