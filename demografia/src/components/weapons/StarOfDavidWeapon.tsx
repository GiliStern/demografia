import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Projectile } from '../Projectile';
import { useGameStore } from '../../store/gameStore';

export const StarOfDavidWeapon = () => {
  const [projectiles, setProjectiles] = useState<any[]>([]);
  const lastFireTime = useRef(0);
  const { playerPosition, playerDirection, playerStats, isPaused } = useGameStore();
  
  const cooldown = 0.5 * playerStats.cooldown;
  const speed = 15;
  const duration = 1.5;

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
    
    const length = Math.sqrt(dirX*dirX + dirY*dirY) || 1;
    const vX = (dirX / length) * speed;
    const vY = (dirY / length) * speed;
    
    const newProjectile = {
      id: Math.random().toString(),
      position: [playerPosition.x, playerPosition.y, 0] as [number, number, number],
      velocity: [vX, vY] as [number, number],
      duration
    };
    
    setProjectiles(prev => [...prev, newProjectile]);
  };

  const removeProjectile = (id: string) => {
    setProjectiles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      {projectiles.map(p => (
        <Projectile 
          key={p.id}
          {...p}
          spriteConfig={{ textureName: 'weapons', index: 4 }}
          onDespawn={() => removeProjectile(p.id)}
          damage={10}
        />
      ))}
    </>
  );
};

