import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Projectile } from "../Projectile";
import { useGameStore } from "../../store/gameStore";
import { WEAPONS, WeaponId } from "../../data/config/weapons";
import type { ProjectileData } from "@/types";

export const StarOfDavidWeapon = () => {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const lastFireTime = useRef(0);
  const { playerPosition, playerDirection, playerStats, isPaused } =
    useGameStore();

  const weaponId = WeaponId.Knife;
  const weaponData = WEAPONS[weaponId];
  const stats = weaponData?.stats;
  const spriteConfig = weaponData?.sprite_config;

  const cooldown = (stats?.cooldown || 0.5) * playerStats.cooldown;
  const speed = stats?.speed || 15;
  const duration = stats?.duration || 1.5;
  const damage = stats?.damage || 10;

  useFrame((state) => {
    if (isPaused) return;

    const time = state.clock.getElapsedTime();
    if (time - lastFireTime.current > cooldown) {
      fire(time);
    }
  });

  const fire = (time: number) => {
    lastFireTime.current = time;

    // Determine direction
    let dirX = playerDirection.x;
    let dirY = playerDirection.y;

    if (dirX === 0 && dirY === 0) dirX = 1;

    const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const vX = (dirX / length) * speed;
    const vY = (dirY / length) * speed;

    const newProjectile: ProjectileData = {
      id: Math.random().toString(),
      position: { x: playerPosition.x, y: playerPosition.y, z: 0 },
      velocity: { x: vX, y: vY },
      duration,
      damage,
    };

    setProjectiles((prev) => [...prev, newProjectile]);
  };

  const removeProjectile = (id: string) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {projectiles.map((p) => (
        <Projectile
          key={p.id}
          {...p}
          spriteConfig={spriteConfig}
          onDespawn={() => removeProjectile(p.id)}
          damage={damage}
        />
      ))}
    </>
  );
};
