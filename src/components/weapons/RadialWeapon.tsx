import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import type { WeaponComponentProps } from "@/types";
import { useGameStore } from "@/hooks/useGameStore";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { Sprite } from "../Sprite";
import { radialDirections } from "@/utils/weaponMath";
import { WeaponId } from "@/types";

interface RadialProjectile {
  id: string;
  direction: { x: number; y: number };
  birth: number;
}

export const RadialWeapon = ({ weaponId }: WeaponComponentProps) => {
  const [projectiles, setProjectiles] = useState<RadialProjectile[]>([]);
  const lastFireTime = useRef(0);
  const bodiesRef = useRef<Map<string, RapierRigidBody>>(new Map());
  const {
    playerPosition,
    playerStats,
    isPaused,
    isRunning,
    getWeaponStats,
  } = useGameStore();

  const weapon = WEAPONS[weaponId];
  const spriteConfig = weapon?.sprite_config;
  const stats = weapon ? getWeaponStats(weaponId) : undefined;
  const damage = (stats?.damage ?? 0) * (playerStats.might || 1);
  const speed = stats?.speed ?? 0;
  const duration = stats?.duration ?? 0;
  const amount = stats?.amount ?? 8;
  const cooldown =
    (stats?.cooldown ?? Number.POSITIVE_INFINITY) * playerStats.cooldown;

  const fire = (time: number) => {
    lastFireTime.current = time;
    const dirs = radialDirections(amount);
    const shots = dirs.map((d, idx) => ({
      id: `${time}-${idx}`,
      direction: d,
      birth: time,
    }));
    setProjectiles(shots);
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;
    const time = state.clock.getElapsedTime();
    if (time - lastFireTime.current > cooldown) {
      fire(time);
    }

    // Despawn after duration
    if (duration > 0) {
      setProjectiles((prev) => prev.filter((p) => time - p.birth <= duration));
    }
  });

  if (!spriteConfig) return null;

  return (
    <>
      {projectiles.map((p) => {
        const startX = playerPosition.x;
        const startY = playerPosition.y;
        return (
          <RigidBody
            key={p.id}
            ref={(body) => {
              if (body) bodiesRef.current.set(p.id, body);
              else bodiesRef.current.delete(p.id);
            }}
            type="kinematicVelocity"
            lockRotations
            gravityScale={0}
            sensor
            position={[startX, startY, 0]}
            linearVelocity={[
              p.direction.x * speed,
              p.direction.y * speed,
              0,
            ]}
            userData={{ type: "projectile", id: p.id, damage, owner: "player" }}
          >
            <CuboidCollider args={[0.35, 0.35, 0.35]} />
            <Sprite
              textureUrl={spriteConfig.textureUrl}
              index={spriteConfig.index}
              scale={spriteConfig.scale}
              {...(spriteConfig.spriteFrameSize
                ? { spriteFrameSize: spriteConfig.spriteFrameSize }
                : {})}
            />
          </RigidBody>
        );
      })}
    </>
  );
};

