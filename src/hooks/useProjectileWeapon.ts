import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  WeaponId,
  type ProjectileData,
  type ProjectileWeaponInstance,
} from "../types";
import { WEAPONS } from "../data/config/weaponsConfig";
import { useGameStore } from "./useGameStore";
import { resolveDirection } from "../utils/weaponUtils";

interface ProjectileWeaponHookParams {
  weaponId: WeaponId;
}

export function useProjectileWeapon({
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
  } = useGameStore();

  const weaponData = WEAPONS[weaponId];
  const { sprite_config: spriteConfig } = weaponData;
  const stats = getWeaponStats(weaponId);
  const damage = stats.damage * (playerStats.might || 1);
  const speed = stats.speed;
  const duration = stats.duration;
  const amount = stats.amount;
  const cooldown = stats.cooldown;

  const fire = (time: number) => {
    lastFireTime.current = time;

    const { x: dirX, y: dirY } = resolveDirection(
      playerDirection.x,
      playerDirection.y
    );
    const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const baseVX = (dirX / length) * speed;
    const baseVY = (dirY / length) * speed;

    const newShots = Array.from({ length: amount }).map((_, index) => {
      // minimal spread for multi-shot
      const spread = 0.1 * (index - (amount - 1) / 2);
      const vX = baseVX + spread;
      const vY = baseVY + spread;
      const newProjectile: ProjectileData = {
        id: Math.random().toString(),
        position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
        velocity: { x: vX, y: vY },
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

  const weaponInstance: ProjectileWeaponInstance = {
    projectiles,
    spriteConfig,
    damage,
    removeProjectile,
    cooldown,
    speed,
    duration,
    shouldSpin: weaponData.shouldSpin,
  };

  return weaponInstance;
}

