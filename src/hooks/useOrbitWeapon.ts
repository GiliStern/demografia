import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import type { WeaponId, WeaponStats, PlayerStats, SpriteConfig } from "@/types";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { useGameStore } from "@/hooks/useGameStore";
import { radialDirections } from "@/utils/weaponMath";

export interface OrbitingOrb {
  id: string;
  angleOffset: number;
  spawnedAt: number;
}

export interface OrbitWeaponInstance {
  orbiters: OrbitingOrb[];
  spriteConfig?: SpriteConfig;
  damage: number;
  radius: number;
  baseAngleRef: MutableRefObject<number>;
  playerPosition: { x: number; y: number };
}

const ORBIT_RADIUS_MULTIPLIER = 1.5;

const createOrbiters = (amount: number, time: number): OrbitingOrb[] => {
  const directions = radialDirections(amount);
  return directions.map((dir, idx) => ({
    id: `${time}-${idx}`,
    angleOffset: Math.atan2(dir.y, dir.x),
    spawnedAt: time,
  }));
};

const buildOrbitRuntime = (stats: WeaponStats, playerStats: PlayerStats) => {
  const cooldownStat =
    stats.cooldownPause ?? stats.cooldown ?? Number.POSITIVE_INFINITY;
  const cooldownMultiplier = playerStats.cooldown || 1;
  return {
    damage: (stats.damage ?? 0) * (playerStats.might || 1),
    angularSpeed: stats.speed ?? 0,
    radius:
      (stats.area ?? 1) * (playerStats.area || 1) * ORBIT_RADIUS_MULTIPLIER,
    respawnDelay: cooldownStat * cooldownMultiplier,
    waveDuration: stats.duration ?? 0,
    amount: stats.amount ?? 0,
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

  const { playerPosition, playerStats, isPaused, isRunning, getWeaponStats } =
    useGameStore();

  const weapon = WEAPONS[weaponId];
  const spriteConfig = weapon?.sprite_config;
  const stats = weapon ? getWeaponStats(weaponId) : undefined;

  const runtime = useMemo(
    () =>
      stats && playerStats
        ? buildOrbitRuntime(stats, playerStats)
        : {
            damage: 0,
            angularSpeed: 0,
            radius: 0,
            respawnDelay: Number.POSITIVE_INFINITY,
            waveDuration: 0,
            amount: 0,
          },
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
    spawnOrbiters(performance.now() / 1000);
  }, [spawnOrbiters]);

  useFrame((state, delta) => {
    if (isPaused || !isRunning) return;

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

