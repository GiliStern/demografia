import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import type { WeaponComponentProps, ProjectileData } from "@/types";
import { useGameStore } from "@/hooks/useGameStore";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { reflectInBounds } from "@/utils/weaponMath";
import { Sprite } from "../Sprite";
import { WeaponId } from "@/types";

interface BounceProjectile extends ProjectileData {
  velocity: { x: number; y: number };
  birth: number;
}

const BOUNDS = 20; // simple world bounds for reflection

export const BounceWeapon = ({ weaponId }: WeaponComponentProps) => {
  const [projectiles, setProjectiles] = useState<BounceProjectile[]>([]);
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
  const amount = stats?.amount ?? 1;
  const cooldown =
    (stats?.cooldown ?? Number.POSITIVE_INFINITY) * playerStats.cooldown;

  const fire = (time: number) => {
    lastFireTime.current = time;
    const shots: BounceProjectile[] = Array.from({ length: amount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      return {
        id: crypto.randomUUID?.() ?? Math.random().toString(),
        position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
        velocity: { x: vx, y: vy },
        duration,
        damage,
        birth: time,
      };
    });
    setProjectiles((prev) => [...prev, ...shots]);
  };

  useFrame((state, delta) => {
    if (isPaused || !isRunning) return;
    const time = state.clock.getElapsedTime();
    if (time - lastFireTime.current > cooldown) {
      fire(time);
    }

    setProjectiles((prev) =>
      prev
        .map((p) => {
          if (time - p.birth > p.duration) {
            bodiesRef.current.delete(p.id);
            return null;
          }
          const body = bodiesRef.current.get(p.id);
          if (!body) return p;
          const pos = body.translation();
          const nextVel = reflectInBounds(
            { x: pos.x, y: pos.y },
            p.velocity,
            BOUNDS
          );
          body.setLinvel({ x: nextVel.x, y: nextVel.y, z: 0 }, true);
          return { ...p, velocity: nextVel };
        })
        .filter((p): p is BounceProjectile => !!p)
    );
  });

  if (!spriteConfig) return null;

  return (
    <>
      {projectiles.map((p) => (
        <RigidBody
          key={p.id}
          ref={(body) => {
            if (body) bodiesRef.current.set(p.id, body);
            else bodiesRef.current.delete(p.id);
          }}
          position={[p.position.x, p.position.y, p.position.z]}
          type="dynamic"
          gravityScale={0}
          lockRotations
          sensor
          userData={{ type: "projectile", id: p.id, damage, owner: "player" }}
        >
          <CuboidCollider args={[0.25, 0.25, 0.25]} />
          <Sprite
            textureUrl={spriteConfig.textureUrl}
            index={spriteConfig.index}
            scale={spriteConfig.scale}
            {...(spriteConfig.spriteFrameSize
              ? { spriteFrameSize: spriteConfig.spriteFrameSize }
              : {})}
          />
        </RigidBody>
      ))}
    </>
  );
};

