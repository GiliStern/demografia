import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, ProjectileWeaponInstance } from "../types";
import { WEAPONS, WeaponId } from "../data/config/weapons";
import { useGameStore } from "../store/gameStore";
import { DEFAULT_WEAPON_STATS, resolveDirection } from "./weapons";

interface ProjectileWeaponHookParams {
  weaponId: WeaponId;
}

export function useProjectileWeapon({
  weaponId,
}: ProjectileWeaponHookParams): ProjectileWeaponInstance {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const lastFireTime = useRef(0);
  const { playerPosition, playerDirection, playerStats, isPaused, isRunning } =
    useGameStore();

  const weaponData = WEAPONS[weaponId];
  const { stats, sprite_config: spriteConfig } = weaponData;
  const { damage, speed, duration } = stats;

  const cooldown = stats.cooldown * playerStats.cooldown;

  const fire = (time: number) => {
    lastFireTime.current = time;

    const { x: dirX, y: dirY } = resolveDirection(
      playerDirection.x,
      playerDirection.y
    );
    const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const vX = (dirX / length) * speed;
    const vY = (dirY / length) * speed;

    const newProjectile: ProjectileData = {
      id: Math.random().toString(),
      position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
      velocity: { x: vX, y: vY },
      duration,
      damage,
    };

    setProjectiles((prev: ProjectileData[]) => [...prev, newProjectile]);
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
  };

  return weaponInstance;
}
