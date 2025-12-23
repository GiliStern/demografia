import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { WeaponId } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { reflectInBounds } from "@/utils/weapons/weaponMath";
import type { CentralizedProjectile } from "@/types";

interface UseBounceWeaponParams {
  weaponId: WeaponId;
}

/**
 * Custom hook for bounce weapon behavior - fires projectiles that bounce at screen edges
 * Now uses centralized projectile store for batched rendering
 */
export function useBounceWeapon({ weaponId }: UseBounceWeaponParams): void {
  const lastFireTime = useRef(0);

  // Zustand selectors
  const {
    playerPosition,
    isPaused,
    isRunning,
    getWeaponStats,
    getEffectivePlayerStats,
    addProjectiles,
    updateProjectile,
  } = useGameStore();
  
  const playerStats = getEffectivePlayerStats();
  const projectilesMap = useGameStore((state) => state.projectiles);

  const weapon = WEAPONS[weaponId];
  const stats = getWeaponStats(weaponId);
  const damage = stats.damage * (playerStats.might || 1);
  const speed = stats.speed;
  const duration = stats.duration;
  const amount = stats.amount;
  const cooldown =
    (stats.cooldown ?? Number.POSITIVE_INFINITY) * playerStats.cooldown;

  // Fire projectiles in random directions
  const fire = (time: number) => {
    lastFireTime.current = time;
    const shots: CentralizedProjectile[] = Array.from({ length: amount }).map(
      (_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        return {
          id: `${weaponId}-${time}-${idx}`,
          position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
          velocity: { x: vx, y: vy },
          damage,
          textureUrl: weapon.sprite_config.textureUrl,
          spriteIndex: weapon.sprite_config.index,
          spriteFrameSize: weapon.sprite_config.spriteFrameSize ?? 32,
          scale: weapon.sprite_config.scale,
          spawnTime: time,
          duration,
          weaponId,
          behaviorType: "bounce" as const,
        };
      }
    );
    addProjectiles(shots);
  };

  // Handle firing and bouncing logic
  useFrame((state) => {
    if (isPaused || !isRunning) return;

    const time = state.clock.getElapsedTime();

    // Fire new projectiles
    if (time - lastFireTime.current > cooldown) {
      fire(time);
    }

    // Get viewport bounds for bouncing at screen edges
    const viewportBounds = useGameStore.getState().viewportBounds;
    if (!viewportBounds) return;

    // Update bounce projectiles - only handle velocity changes, not removal
    const bounceProjectiles = Array.from(projectilesMap.values()).filter(
      (p: CentralizedProjectile) =>
        p.weaponId === weaponId && p.behaviorType === "bounce"
    );

    for (const p of bounceProjectiles) {
      // Check and apply bounce
      const nextVel = reflectInBounds(
        { x: p.position.x, y: p.position.y },
        p.velocity,
        playerPosition,
        viewportBounds.halfWidth,
        viewportBounds.halfHeight
      );

      // Update velocity if changed
      if (nextVel.x !== p.velocity.x || nextVel.y !== p.velocity.y) {
        updateProjectile(p.id, { velocity: nextVel });
      }
    }
  });
}
