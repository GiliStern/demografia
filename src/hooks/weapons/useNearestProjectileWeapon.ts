import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, WeaponId } from "@/types";
import { getWeapon } from "@/data/config/weaponsNormalized";
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

  const playerPosition = useGameStore((state) => state.playerPosition);
  const playerDirection = useGameStore((state) => state.playerDirection);
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const getWeaponStats = useGameStore((state) => state.getWeaponStats);
  const getEffectivePlayerStats = useGameStore(
    (state) => state.getEffectivePlayerStats
  );
  const getEnemyPositions = useGameStore((state) => state.getEnemyPositions);
  const addProjectiles = useGameStore((state) => state.addProjectiles);

  const playerStats = getEffectivePlayerStats();

  const weaponData = getWeapon(weaponId);
  const stats = getWeaponStats(weaponId);
  const runtime = buildWeaponRuntime(stats, playerStats);

  const fire = (time: number) => {
    const targetDir =
      nearestEnemyDirection(playerPosition, getEnemyPositions()) ??
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

    if (immediateShots.length > 0 && weaponData) {
      // Convert to centralized projectiles
      const centralizedProjectiles: CentralizedProjectile[] =
        immediateShots.map((shot) => ({
          id: shot.id,
          position: shot.position,
          velocity: shot.velocity,
          damage: shot.damage,
          textureUrl: weaponData.spriteConfig.textureUrl,
          spriteIndex: weaponData.spriteConfig.index,
          spriteFrameSize: weaponData.spriteConfig.spriteFrameSize ?? 32,
          scale: weaponData.spriteConfig.scale,
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
    if (isPaused || !isRunning || !weaponData) return;

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

        if (released.length > 0 && weaponData) {
          const centralizedProjectiles: CentralizedProjectile[] = released.map(
            (shot) => ({
              id: shot.id,
              position: shot.position,
              velocity: shot.velocity,
              damage: shot.damage,
              textureUrl: weaponData.spriteConfig.textureUrl,
              spriteIndex: weaponData.spriteConfig.index,
              spriteFrameSize: weaponData.spriteConfig.spriteFrameSize ?? 32,
              scale: weaponData.spriteConfig.scale,
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
