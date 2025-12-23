import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { WeaponStats, PlayerStats, WeaponId } from "@/types";
import type { OrbitingOrb, OrbitWeaponInstance } from "@/types/hooks/weapons";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { useGameStore } from "@/store/gameStore";
import { radialDirections } from "@/utils/weapons/weaponMath";

// Re-export for components
export type { OrbitingOrb };

const ORBIT_RADIUS_MULTIPLIER = 1.5;

// Generate evenly spread orbiters around the player at a given spawn time.
const createOrbiters = (amount: number, time: number): OrbitingOrb[] => {
  const directions = radialDirections(amount);
  return directions.map((dir, idx) => ({
    id: `${time}-${idx}`,
    angleOffset: Math.atan2(dir.y, dir.x),
    spawnedAt: time,
  }));
};

// Compute runtime values that already include player stat multipliers.
const buildOrbitRuntime = (stats: WeaponStats, playerStats: PlayerStats) => {
  const cooldownStat =
    stats.cooldownPause ?? stats.cooldown ?? Number.POSITIVE_INFINITY;
  const cooldownMultiplier = playerStats.cooldown || 1;
  return {
    damage: stats.damage * (playerStats.might || 1),
    angularSpeed: stats.speed,
    radius: stats.area * playerStats.area * ORBIT_RADIUS_MULTIPLIER,
    respawnDelay: cooldownStat * cooldownMultiplier,
    waveDuration: stats.duration,
    amount: stats.amount,
  };
};

export const useOrbitWeapon = ({
  weaponId,
}: {
  weaponId: WeaponId;
}): OrbitWeaponInstance => {
  const [orbiters, setOrbiters] = useState<OrbitingOrb[]>([]);
  const orbitersRef = useRef<OrbitingOrb[]>([]);
  const lastSpawnRef = useRef(0);
  const baseAngleRef = useRef(0);

  const { playerPosition, isPaused, isRunning, getWeaponStats, getEffectivePlayerStats } =
    useGameStore();
  
  const playerStats = getEffectivePlayerStats();

  const weapon = WEAPONS[weaponId];
  const spriteConfig = weapon.sprite_config;
  const stats = getWeaponStats(weaponId);

  const runtime = useMemo(
    () => buildOrbitRuntime(stats, playerStats),
    [stats, playerStats]
  );

  const syncOrbiters = useCallback((next: OrbitingOrb[]) => {
    orbitersRef.current = next;
    setOrbiters(next);
  }, []);

  const spawnOrbiters = useCallback(
    (time: number) => {
      const batch = createOrbiters(runtime.amount, time);
      lastSpawnRef.current = time;
      syncOrbiters(batch);
    },
    [runtime.amount, syncOrbiters]
  );

  const expireOrbiters = useCallback(
    (time: number) => {
      if (runtime.waveDuration <= 0) return;
      const active = orbitersRef.current.filter(
        (orb) => time - orb.spawnedAt <= runtime.waveDuration
      );
      if (active.length !== orbitersRef.current.length) {
        syncOrbiters(active);
      }
    },
    [runtime.waveDuration, syncOrbiters]
  );

  useEffect(() => {
    // Spawn the initial ring as soon as the hook mounts.
    spawnOrbiters(performance.now() / 1000);
  }, [spawnOrbiters]);

  useFrame((state, delta) => {
    if (isPaused || !isRunning) return;

    // Advance the orbit angle each frame.
    baseAngleRef.current += runtime.angularSpeed * delta;

    const time = state.clock.getElapsedTime();
    expireOrbiters(time);

    const shouldRespawn =
      orbitersRef.current.length === 0 &&
      time - lastSpawnRef.current >= runtime.respawnDelay;
    if (shouldRespawn) {
      spawnOrbiters(time);
    }
  });

  return {
    orbiters,
    spriteConfig,
    damage: runtime.damage,
    radius: runtime.radius,
    baseAngleRef,
    playerPosition,
  };
};
