import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import type { ProjectileData, WeaponComponentProps } from "@/types";
import { useGameStore } from "@/hooks/useGameStore";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { Sprite } from "../Sprite";
import { radialDirections } from "@/utils/weaponMath";
import {
  buildWeaponRuntime,
  filterByDuration,
  shouldFire,
} from "@/utils/weaponLifecycle";
import { createDirectionalProjectiles } from "@/utils/weaponProjectiles";

type RadialProjectile = {
  birth: number;
} & ProjectileData;

export const RadialWeapon = ({ weaponId }: WeaponComponentProps) => {
  const [projectiles, setProjectiles] = useState<RadialProjectile[]>([]);
  const lastFireTime = useRef(0);
  const bodiesRef = useRef<Map<string, RapierRigidBody>>(new Map());
  const { playerPosition, playerStats, isPaused, isRunning, getWeaponStats } =
    useGameStore();

  const weapon = WEAPONS[weaponId];
  const spriteConfig = weapon.sprite_config;
  const stats = getWeaponStats(weaponId);
  const runtime = buildWeaponRuntime(stats, playerStats);

  const fire = (time: number) => {
    lastFireTime.current = time;
    const dirs = radialDirections(runtime.amount);
    const shots: RadialProjectile[] = createDirectionalProjectiles({
      directions: dirs,
      speed: runtime.speed,
      position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
      damage: runtime.damage,
      duration: runtime.duration,
      idFactory: (idx) => `${time}-${idx}`,
    }).map(
      (shot: ProjectileData): RadialProjectile => ({
        ...shot,
        birth: time,
      })
    );
    setProjectiles(shots);
  };

  useFrame((state) => {
    if (isPaused || !isRunning) return;
    const time = state.clock.getElapsedTime();
    if (shouldFire(time, lastFireTime.current, runtime.cooldown)) {
      fire(time);
    }

    // Despawn after duration
    setProjectiles((prev) => filterByDuration(prev, runtime.duration, time));
  });

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
            linearVelocity={[p.velocity.x, p.velocity.y, 0]}
            userData={{
              type: "projectile",
              id: p.id,
              damage: runtime.damage,
              owner: "player",
            }}
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
