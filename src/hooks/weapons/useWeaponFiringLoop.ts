import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { CentralizedProjectile, ProjectileData, WeaponId } from "@/types";
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
  descriptor: WeaponBehaviorDescriptor,
): void {
  const {
    weaponId,
    targeting,
    useStagger = false,
    spreadStep = 0.1,
  } = descriptor;
  const behaviorType = descriptor.behaviorType ?? "normal";

  const lastFireTime = useRef(0);
  const pendingShots = useRef<number[]>([]);
  const nextStaggerTime = useRef<number | null>(null);

  const ctx = getGameplayContext();
  const weaponData = getWeapon(weaponId);

  const produceSingleShot = (
    index: number,
    time: number,
    runtime: WeaponRuntime,
  ): ProjectileData => {
    const pos = ctx.getPlayerPosition();
    const position = { x: pos.x, y: pos.y, z: 0 };

    switch (targeting) {
      case "playerDirection": {
        const dir = ctx.getPlayerDirection();
        const direction = resolveDirection(dir.x, dir.y);
        const baseVelocity = buildVelocity(direction, runtime.speed);
        const offset = spreadStep * (index - (runtime.amount - 1) / 2);
        return createSpreadProjectiles({
          amount: 1,
          baseVelocity: {
            x: baseVelocity.x + offset,
            y: baseVelocity.y + offset,
          },
          spreadStep: 0,
          position,
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
          idFactory: () => `${weaponId}-${time}-${index}`,
        })[0]!;
      }
      case "nearestEnemy": {
        const playerPos = ctx.getPlayerPosition();
        const playerDir = ctx.getPlayerDirection();
        const targetDir =
          nearestEnemyDirection(playerPos, ctx.getEnemyPositions()) ??
          resolveDirection(playerDir.x, playerDir.y);
        const baseVelocity = buildVelocity(targetDir, runtime.speed);
        return createSpreadProjectiles({
          amount: 1,
          baseVelocity,
          spreadStep: 0,
          position,
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
          idFactory: () => `${weaponId}-${time}-${index}`,
        })[0]!;
      }
      case "radial": {
        const dirs = radialDirections(runtime.amount);
        const dir = dirs[index] ?? dirs[0] ?? { x: 1, y: 0 };
        return createDirectionalProjectiles({
          directions: [dir],
          speed: runtime.speed,
          position,
          damage: runtime.damage,
          duration: runtime.duration,
          pierce: runtime.pierce,
          idFactory: () => `${weaponId}-${time}-${index}`,
        })[0]!;
      }
      case "randomDirection": {
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * runtime.speed;
        const vy = Math.sin(angle) * runtime.speed;
        return {
          id: `${weaponId}-${time}-${index}`,
          position,
          velocity: { x: vx, y: vy },
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
        };
      }
      case "arc": {
        const cfg = descriptor.arcConfig ?? {
          gravity: 9.8,
          minAngle: Math.PI / 4,
          angleSpan: Math.PI / 2,
        };
        const angle = Math.random() * cfg.angleSpan + cfg.minAngle;
        return {
          id: `${weaponId}-${time}-${index}`,
          position,
          velocity: {
            x: Math.cos(angle) * runtime.speed,
            y: Math.sin(angle) * runtime.speed,
          },
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
        };
      }
      default:
        return {
          id: `${weaponId}-${time}-${index}`,
          position,
          velocity: { x: 0, y: 0 },
          duration: runtime.duration,
          damage: runtime.damage,
          pierce: runtime.pierce,
        };
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

    const overrides = getOverrides();
    const amount = Math.max(
      1,
      targeting === "nearestEnemy" ? runtime.amount || 1 : runtime.amount,
    );

    if (useStagger) {
      const { immediateIndex } = enqueueStaggeredShots({
        amount,
        time,
        pendingShots,
        nextStaggerTime,
      });
      if (immediateIndex !== null) {
        const shot = produceSingleShot(immediateIndex, time, runtime);
        const centralized = toCentralizedProjectile(
          shot,
          weaponData,
          weaponId,
          time,
          behaviorType,
          overrides,
        );
        ctx.addProjectiles([centralized]);
      }
    } else {
      const centralized: CentralizedProjectile[] = [];
      for (let i = 0; i < amount; i++) {
        const shot = produceSingleShot(i, time, runtime);
        centralized.push(
          toCentralizedProjectile(
            shot,
            weaponData,
            weaponId,
            time,
            behaviorType,
            overrides,
          ),
        );
      }
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
        produceShot: (index) => produceSingleShot(index, time, runtime),
        setProjectiles: (released) => {
          const shots =
            typeof released === "function" ? released([]) : released;
          if (shots.length > 0 && weaponData) {
            const overrides = getOverrides();
            const centralized = shots.map((shot) =>
              toCentralizedProjectile(
                shot,
                weaponData,
                weaponId,
                time,
                behaviorType,
                overrides,
              ),
            );
            ctx.addProjectiles(centralized);
          }
        },
      });
    }
  });
}
