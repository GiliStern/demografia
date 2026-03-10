import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { WeaponId } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { getPlayerPositionSnapshot } from "@/store/gameStoreAccess";
import { WEAPONS } from "@/data/config/weaponsConfig";
import type { CentralizedProjectile } from "@/types";

interface UseBounceWeaponParams {
  weaponId: WeaponId;
}

/**
 * Custom hook for bounce weapon behavior - fires projectiles that bounce at screen edges.
 * Bounce simulation is handled by the projectile manager in BatchedProjectileRenderer.
 */
export function useBounceWeapon({ weaponId }: UseBounceWeaponParams): void {
  const lastFireTime = useRef(0);

  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const getWeaponStats = useGameStore((state) => state.getWeaponStats);
  const getEffectivePlayerStats = useGameStore(
    (state) => state.getEffectivePlayerStats
  );
  const addProjectiles = useGameStore((state) => state.addProjectiles);

  const playerStats = getEffectivePlayerStats();

  const weapon = WEAPONS[weaponId];
  const stats = getWeaponStats(weaponId);
  const damage = stats.damage * (playerStats.might || 1);
  const speed = stats.speed;
  const duration = stats.duration;
  const amount = stats.amount;
  const cooldown =
    (stats.cooldown ?? Number.POSITIVE_INFINITY) * playerStats.cooldown;

  const fire = (time: number) => {
    lastFireTime.current = time;
    const freshPlayerPosition = getPlayerPositionSnapshot();
    const shots: CentralizedProjectile[] = Array.from({ length: amount }).map(
      (_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        return {
          id: `${weaponId}-${time}-${idx}`,
          position: { x: freshPlayerPosition.x, y: freshPlayerPosition.y, z: 0 },
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
          shouldSpin: weapon.shouldSpin,
        };
      }
    );
    addProjectiles(shots);
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;

    const time = state.clock.getElapsedTime();
    if (time - lastFireTime.current > cooldown) {
      fire(time);
    }
  });
}
