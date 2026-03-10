import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ProjectileData, WeaponId } from "@/types";
import type { CentralizedProjectile } from "@/types";
import { getWeapon } from "@/data/config/weaponsNormalized";
import { useProjectilesStore } from "@/store/gameStore";
import { getEnemyPositionsRegistrySnapshot } from "@/store/gameStoreAccess";
import { usePlayerStore } from "@/store/playerStore";
import { useSessionStore } from "@/store/sessionStore";
import { useWeaponsStore } from "@/store/weaponsStore";
import {
  getPlayerPositionSnapshot,
  getPlayerDirectionSnapshot,
} from "@/store/gameStoreAccess";
import { resolveDirection } from "@/utils/weapons/weaponUtils";
import { nearestEnemyDirection } from "@/utils/weapons/weaponMath";
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

  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);
  const getWeaponStats = useWeaponsStore((state) => state.getWeaponStats);
  const getEffectivePlayerStats = usePlayerStore(
    (state) => state.getEffectivePlayerStats
  );
  const addProjectiles = useProjectilesStore((state) => state.addProjectiles);
  const playerPosition = usePlayerStore((state) => state.playerPosition);
  const playerDirection = usePlayerStore((state) => state.playerDirection);

  const playerStats = getEffectivePlayerStats();
  const weaponData = getWeapon(weaponId);
  const stats = getWeaponStats(weaponId);
  const runtime = buildWeaponRuntime(stats, playerStats);

  const produceShots = (time: number): ProjectileData[] => {
    const pos = getPlayerPositionSnapshot();
    const position = { x: pos.x, y: pos.y, z: 0 };

    switch (targeting) {
      case "playerDirection": {
        const dir = getPlayerDirectionSnapshot();
        const direction = resolveDirection(dir.x, dir.y);
        const baseVelocity = buildVelocity(direction, runtime.speed);
        return createSpreadProjectiles({
          amount: runtime.amount,
          baseVelocity,
          spreadStep,
          position,
          duration: runtime.duration,
          damage: runtime.damage,
          idFactory: (idx) => `${weaponId}-${time}-${idx}`,
        });
      }
      case "nearestEnemy": {
        const targetDir =
          nearestEnemyDirection(playerPosition, getEnemyPositionsRegistrySnapshot()) ??
          resolveDirection(playerDirection.x, playerDirection.y);
        const baseVelocity = buildVelocity(targetDir, runtime.speed);
        return createSpreadProjectiles({
          amount: runtime.amount || 1,
          baseVelocity,
          spreadStep: 0,
          position,
          duration: runtime.duration,
          damage: runtime.damage,
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

  const fire = (time: number) => {
    if (!weaponData) return;

    const shots = produceShots(time);
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
        addProjectiles(centralized);
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
      addProjectiles(centralized);
    }

    lastFireTime.current = time;
  };

  useFrame((state) => {
    if (isPaused || !isRunning || !weaponData) return;

    const time = state.clock.getElapsedTime();

    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time);
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
            addProjectiles(centralized);
          }
        },
      });
    }
  });
}
