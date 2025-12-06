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
import { buildWeaponRuntime, shouldFire } from "@/utils/weaponLifecycle";
import {
  buildVelocity,
  createSpreadProjectiles,
} from "@/utils/weaponProjectiles";

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
  const runtime = buildWeaponRuntime(stats, playerStats);

  const fire = (time: number) => {
    lastFireTime.current = time;

    const direction = resolveDirection(playerDirection.x, playerDirection.y);
    const baseVelocity = buildVelocity(direction, runtime.speed);

    const newShots = createSpreadProjectiles({
      amount: runtime.amount,
      baseVelocity,
      spreadStep: 0.1,
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

  const weaponInstance: ProjectileWeaponInstance = {
    projectiles,
    spriteConfig,
    damage: runtime.damage,
    removeProjectile,
    cooldown: runtime.cooldown,
    speed: runtime.speed,
    duration: runtime.duration,
    amount: runtime.amount,
    shouldSpin: weaponData.shouldSpin,
  };

  return weaponInstance;
}
