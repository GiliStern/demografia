import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import type { WeaponComponentProps } from "@/types";
import { useGameStore } from "@/store/gameStore";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { Sprite } from "../Sprite";

interface ArcProjectile {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number };
  birth: number;
}

const GRAVITY = 9.8;

export const ArcWeapon = ({ weaponId }: WeaponComponentProps) => {
  const [projectiles, setProjectiles] = useState<ArcProjectile[]>([]);
  const lastFireTime = useRef(0);
  const bodiesRef = useRef<Map<string, RapierRigidBody>>(new Map());
  const { playerPosition, isPaused, isRunning, getWeaponStats, getEffectivePlayerStats } =
    useGameStore();
  
  const playerStats = getEffectivePlayerStats();

  const weapon = WEAPONS[weaponId];
  const spriteConfig = weapon.sprite_config;
  const stats = getWeaponStats(weaponId);
  const damage = stats.damage * (playerStats.might || 1);
  const speed = stats.speed;
  const duration = stats.duration;
  const amount = stats.amount;
  const cooldown =
    (stats.cooldown ?? Number.POSITIVE_INFINITY) * playerStats.cooldown;
  const pierce = stats.pierce;

  const fire = (time: number) => {
    lastFireTime.current = time;
    const shots: ArcProjectile[] = Array.from({ length: amount }).map(() => {
      const angle = Math.random() * (Math.PI / 2) + Math.PI / 4; // high arc
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      return {
        id: crypto.randomUUID?.() ?? Math.random().toString(),
        position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
        velocity: { x: vx, y: vy },
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
          if (time - p.birth > duration) {
            bodiesRef.current.delete(p.id);
            return null;
          }
          const body = bodiesRef.current.get(p.id);
          if (!body) return p;
          const nextVel = {
            x: p.velocity.x,
            y: p.velocity.y - GRAVITY * delta,
          };
          const nextPos = {
            x: body.translation().x + nextVel.x * delta,
            y: body.translation().y + nextVel.y * delta,
            z: 0,
          };
          body.setNextKinematicTranslation(nextPos);
          return { ...p, velocity: nextVel };
        })
        .filter((p): p is ArcProjectile => !!p)
    );
  });

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
          type="kinematicPosition"
          lockRotations
          gravityScale={0}
          sensor
          userData={{
            type: "projectile",
            id: p.id,
            damage,
            owner: "player",
            pierce,
          }}
        >
          <CuboidCollider args={[0.3, 0.3, 0.3]} />
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
