import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { WeaponId } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { radialDirections } from "@/utils/weapons/weaponMath";
import {
  buildWeaponRuntime,
  shouldFire,
} from "@/utils/weapons/weaponLifecycle";
import { createDirectionalProjectiles } from "@/utils/weapons/weaponProjectiles";
import type { CentralizedProjectile } from "@/types";

interface UseRadialWeaponParams {
  weaponId: WeaponId;
}

/**
 * Custom hook for radial weapon behavior - fires projectiles in all directions
 * Now uses centralized projectile store for batched rendering
 */
export function useRadialWeapon({ weaponId }: UseRadialWeaponParams): void {
  const lastFireTime = useRef(0);

  // Zustand selectors
  const {
    playerPosition,
    playerStats,
    isPaused,
    isRunning,
    getWeaponStats,
    addProjectiles,
  } = useGameStore();

  const weapon = WEAPONS[weaponId];
  const stats = getWeaponStats(weaponId);
  const runtime = buildWeaponRuntime(stats, playerStats);

  // Fire projectiles in radial pattern
  const fire = (time: number) => {
    lastFireTime.current = time;
    const dirs = radialDirections(runtime.amount);
    const shots = createDirectionalProjectiles({
      directions: dirs,
      speed: runtime.speed,
      position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
      damage: runtime.damage,
      duration: runtime.duration,
      idFactory: (idx) => `${weaponId}-${time}-${idx}`,
    });

    // Convert to centralized projectiles
    const centralizedProjectiles: CentralizedProjectile[] = shots.map(
      (shot) => ({
        id: shot.id,
        position: shot.position,
        velocity: shot.velocity,
        damage: shot.damage,
        textureUrl: weapon.sprite_config.textureUrl,
        spriteIndex: weapon.sprite_config.index,
        spriteFrameSize: weapon.sprite_config.spriteFrameSize ?? 32,
        scale: weapon.sprite_config.scale,
        spawnTime: time,
        duration: shot.duration,
        weaponId,
        behaviorType: "normal" as const,
      })
    );

    // Add to central store for batched rendering
    addProjectiles(centralizedProjectiles);
  };

  // Handle firing
  useFrame((state) => {
    if (isPaused || !isRunning) {
      return;
    }

    const time = state.clock.getElapsedTime();
    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time);
    }
  });
}
