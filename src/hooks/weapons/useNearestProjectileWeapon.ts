import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, WeaponId } from "@/types";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { useGameStore } from "@/store/gameStore";
import { resolveDirection } from "@/utils/weapons/weaponUtils";
import { nearestEnemyDirection } from "@/utils/weapons/weaponMath";
import {
  buildWeaponRuntime,
  shouldFire,
} from "@/utils/weapons/weaponLifecycle";
import {
  buildVelocity,
  createSpreadProjectiles,
} from "@/utils/weapons/weaponProjectiles";
import {
  enqueueStaggeredShots,
  releaseStaggeredShots,
} from "@/utils/weapons/projectileStagger";
import type { CentralizedProjectile } from "@/types";

interface UseNearestProjectileWeaponParams {
  weaponId: WeaponId;
}

/**
 * Custom hook for nearest-enemy-targeting projectile weapon
 * Now uses centralized projectile store for batched rendering
 */
export function useNearestProjectileWeapon({
  weaponId,
}: UseNearestProjectileWeaponParams): void {
  const lastFireTime = useRef(0);
  const pendingShots = useRef<ProjectileData[]>([]);
  const nextStaggerTime = useRef<number | null>(null);

  const {
    playerPosition,
    playerDirection,
    isPaused,
    isRunning,
    getWeaponStats,
    getEffectivePlayerStats,
    enemiesPositions,
    addProjectiles,
  } = useGameStore();
  
  const playerStats = getEffectivePlayerStats();

  const weaponData = WEAPONS[weaponId];
  const stats = getWeaponStats(weaponId);
  const runtime = buildWeaponRuntime(stats, playerStats);

  const fire = (time: number) => {
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
      idFactory: (idx) => `${weaponId}-${time}-${idx}`,
    });

    const immediateShots = enqueueStaggeredShots({
      shots: newShots,
      time,
      pendingShots,
      nextStaggerTime,
    });

    if (immediateShots.length > 0) {
      // Convert to centralized projectiles
      const centralizedProjectiles: CentralizedProjectile[] =
        immediateShots.map((shot) => ({
          id: shot.id,
          position: shot.position,
          velocity: shot.velocity,
          damage: shot.damage,
          textureUrl: weaponData.sprite_config.textureUrl,
          spriteIndex: weaponData.sprite_config.index,
          spriteFrameSize: weaponData.sprite_config.spriteFrameSize ?? 32,
          scale: weaponData.sprite_config.scale,
          spawnTime: time,
          duration: shot.duration,
          weaponId,
          behaviorType: "normal" as const,
          shouldSpin: weaponData.shouldSpin,
        }));

      addProjectiles(centralizedProjectiles);
    }

    lastFireTime.current = time;
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;

    const time = state.clock.getElapsedTime();
    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time);
    }

    // Release staggered shots
    releaseStaggeredShots({
      time,
      pendingShots,
      nextStaggerTime,
      setProjectiles: (updater) => {
        const released = typeof updater === "function" ? updater([]) : updater;

        if (released.length > 0) {
          const centralizedProjectiles: CentralizedProjectile[] = released.map(
            (shot) => ({
              id: shot.id,
              position: shot.position,
              velocity: shot.velocity,
              damage: shot.damage,
              textureUrl: weaponData.sprite_config.textureUrl,
              spriteIndex: weaponData.sprite_config.index,
              spriteFrameSize: weaponData.sprite_config.spriteFrameSize ?? 32,
              scale: weaponData.sprite_config.scale,
              spawnTime: time,
              duration: shot.duration,
              weaponId,
              behaviorType: "normal" as const,
              shouldSpin: weaponData.shouldSpin,
            })
          );

          addProjectiles(centralizedProjectiles);
        }
      },
    });
  });
}
