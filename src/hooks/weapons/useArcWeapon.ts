import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { WeaponId, CentralizedProjectile } from "@/types";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { useGameStore } from "@/store/gameStore";
import {
  buildWeaponRuntime,
  shouldFire,
} from "@/utils/weapons/weaponLifecycle";

const ARC_GRAVITY = 9.8;
const ARC_MIN_ANGLE = Math.PI / 4;
const ARC_ANGLE_SPAN = Math.PI / 2;

interface UseArcWeaponParams {
  weaponId: WeaponId;
}

export function useArcWeapon({ weaponId }: UseArcWeaponParams): void {
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
  const runtime = buildWeaponRuntime(stats, playerStats);

  const fire = (time: number) => {
    lastFireTime.current = time;

    const freshPlayerPosition = useGameStore.getState().playerPosition;
    const projectiles: CentralizedProjectile[] = Array.from({
      length: runtime.amount,
    }).map((_, idx) => {
      const angle = Math.random() * ARC_ANGLE_SPAN + ARC_MIN_ANGLE;
      return {
        id: `${weaponId}-${time}-${idx}`,
        position: { x: freshPlayerPosition.x, y: freshPlayerPosition.y, z: 0 },
        velocity: {
          x: Math.cos(angle) * runtime.speed,
          y: Math.sin(angle) * runtime.speed,
        },
        acceleration: { x: 0, y: -ARC_GRAVITY },
        damage: runtime.damage,
        textureUrl: weapon.sprite_config.textureUrl,
        spriteIndex: weapon.sprite_config.index,
        spriteFrameSize: weapon.sprite_config.spriteFrameSize ?? 32,
        scale: weapon.sprite_config.scale,
        spawnTime: time,
        duration: runtime.duration,
        weaponId,
        behaviorType: "arc",
        shouldSpin: weapon.shouldSpin,
      };
    });

    addProjectiles(projectiles);
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;

    const time = state.clock.getElapsedTime();
    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time);
    }
  });
}
