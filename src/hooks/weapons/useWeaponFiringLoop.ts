import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, WeaponId } from "@/types";
import type { CentralizedProjectile } from "@/types";
import { getWeapon } from "@/data/config/weaponsNormalized";
import { getGameplayContext } from "@/simulation/gameplayContext";
import { resolveDirection } from "@/utils/weapons/weaponUtils";
import { nearestEnemyDirection } from "@/utils/weapons/weaponMath";
import type { WeaponRuntime } from "@/utils/weapons/weaponLifecycle";
import {
  buildWeaponRuntime,
  shouldFire,
} from "@/utils/weapons/weaponLifecycle";
import {
  buildVelocity,
  createSpreadProjectiles,
  createDirectionalProjectiles,
} from "@/utils/weapons/weaponProjectiles";
import {
  enqueueStaggeredShots,
  releaseStaggeredShots,
} from "@/utils/weapons/projectileStagger";
import {
  toCentralizedProjectile,
  type ToCentralizedProjectileOverrides,
} from "@/utils/weapons/toCentralizedProjectile";
import { radialDirections } from "@/utils/weapons/weaponMath";

export type WeaponTargeting =
  | "playerDirection"
  | "nearestEnemy"
  | "radial"
  | "randomDirection"
  | "arc";

export interface WeaponBehaviorDescriptor {
  weaponId: WeaponId;
  behaviorType?: CentralizedProjectile["behaviorType"];
  targeting: WeaponTargeting;
  useStagger?: boolean;
  spreadStep?: number;
  arcConfig?: { gravity: number; minAngle: number; angleSpan: number };
}

/**
 * Unified weapon firing loop - handles cooldown, firing, and centralized projectile dispatch.
 * Use this for all projectile-based weapons to ensure consistent behavior.
 */
export function useWeaponFiringLoop(
  descriptor: WeaponBehaviorDescriptor
): void {
  const { weaponId, targeting, useStagger = false, spreadStep = 0.1 } =
    descriptor;
  const behaviorType = descriptor.behaviorType ?? "normal";

  const lastFireTime = useRef(0);
  const pendingShots = useRef<ProjectileData[]>([]);
  const nextStaggerTime = useRef<number | null>(null);

  const ctx = getGameplayContext();
  const weaponData = getWeapon(weaponId);

  const produceShots = (time: number, runtime: WeaponRuntime): ProjectileData[] => {
    const pos = ctx.getPlayerPosition();
    const position = { x: pos.x, y: pos.y, z: 0 };

    switch (targeting) {
      case "playerDirection": {
        const dir = ctx.getPlayerDirection();
        const direction = resolveDirection(dir.x, dir.y);
        const baseVelocity = buildVelocity(direction, runtime.speed);
        return createSpreadProjectiles({
          amount: runtime.amount,
          baseVelocity,
          spreadStep,
          position,
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
          idFactory: (idx) => `${weaponId}-${time}-${idx}`,
        });
      }
      case "nearestEnemy": {
        const playerPos = ctx.getPlayerPosition();
        const playerDir = ctx.getPlayerDirection();
        const targetDir =
          nearestEnemyDirection(playerPos, ctx.getEnemyPositions()) ??
          resolveDirection(playerDir.x, playerDir.y);
        const baseVelocity = buildVelocity(targetDir, runtime.speed);
        return createSpreadProjectiles({
          amount: runtime.amount || 1,
          baseVelocity,
          spreadStep: 0,
          position,
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
          idFactory: (idx) => `${weaponId}-${time}-${idx}`,
        });
      }
      case "radial": {
        const dirs = radialDirections(runtime.amount);
        return createDirectionalProjectiles({
          directions: dirs,
          speed: runtime.speed,
          position,
          damage: runtime.damage,
          duration: runtime.duration,
          pierce: runtime.pierce,
          idFactory: (idx) => `${weaponId}-${time}-${idx}`,
        });
      }
      case "randomDirection": {
        return Array.from({ length: runtime.amount }).map((_, idx) => {
          const angle = Math.random() * Math.PI * 2;
          const vx = Math.cos(angle) * runtime.speed;
          const vy = Math.sin(angle) * runtime.speed;
          return {
            id: `${weaponId}-${time}-${idx}`,
            position,
            velocity: { x: vx, y: vy },
            duration: runtime.duration,
            damage: runtime.damage,
            pierce: runtime.pierce,
          };
        });
      }
      case "arc": {
        const cfg = descriptor.arcConfig ?? {
          gravity: 9.8,
          minAngle: Math.PI / 4,
          angleSpan: Math.PI / 2,
        };
        return Array.from({ length: runtime.amount }).map((_, idx) => {
          const angle = Math.random() * cfg.angleSpan + cfg.minAngle;
          return {
            id: `${weaponId}-${time}-${idx}`,
            position,
            velocity: {
              x: Math.cos(angle) * runtime.speed,
              y: Math.sin(angle) * runtime.speed,
            },
            duration: runtime.duration,
            damage: runtime.damage,
            pierce: runtime.pierce,
          };
        });
      }
      default:
        return [];
    }
  };

  const getOverrides = (): ToCentralizedProjectileOverrides | undefined => {
    if (targeting === "arc" && descriptor.arcConfig) {
      return { acceleration: { x: 0, y: -descriptor.arcConfig.gravity } };
    }
    return undefined;
  };

  const fire = (time: number, runtime: WeaponRuntime) => {
    if (!weaponData) return;

    const shots = produceShots(time, runtime);
    const overrides = getOverrides();

    if (useStagger) {
      const immediateShots = enqueueStaggeredShots({
        shots,
        time,
        pendingShots,
        nextStaggerTime,
      });
      if (immediateShots.length > 0) {
        const centralized = immediateShots.map((shot) =>
          toCentralizedProjectile(
            shot,
            weaponData,
            weaponId,
            time,
            behaviorType,
            overrides
          )
        );
        ctx.addProjectiles(centralized);
      }
    } else {
      const centralized = shots.map((shot) =>
        toCentralizedProjectile(
          shot,
          weaponData,
          weaponId,
          time,
          behaviorType,
          overrides
        )
      );
      ctx.addProjectiles(centralized);
    }

    lastFireTime.current = time;
  };

  useFrame((state) => {
    const { isPaused, isRunning } = ctx.getSessionState();
    if (isPaused || !isRunning || !weaponData) return;

    const playerStats = ctx.getEffectivePlayerStats();
    const stats = ctx.getWeaponStats(weaponId);
    const runtime = buildWeaponRuntime(stats, playerStats);

    const time = state.clock.getElapsedTime();

    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time, runtime);
    }

    if (useStagger) {
      releaseStaggeredShots({
        time,
        pendingShots,
        nextStaggerTime,
        setProjectiles: (updater) => {
          const released =
            typeof updater === "function" ? updater([]) : updater;
          if (released.length > 0 && weaponData) {
            const overrides = getOverrides();
            const centralized = released.map((shot) =>
              toCentralizedProjectile(
                shot,
                weaponData,
                weaponId,
                time,
                behaviorType,
                overrides
              )
            );
            ctx.addProjectiles(centralized);
          }
        },
      });
    }
  });
}
