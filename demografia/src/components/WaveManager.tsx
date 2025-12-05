import { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Enemy } from './Enemy';
import { useGameStore } from '../store/gameStore';
import wavesData from '../data/waves.json';

// @ts-ignore
const waves = wavesData as any; // Simplified for prototype

export const WaveManager = () => {
  const [enemies, setEnemies] = useState<any[]>([]);
  const { runTimer, playerPosition, isPaused } = useGameStore();
  
  // Spawn logic
  useFrame(() => {
    if (isPaused) return;
    
    // Find current wave based on timer
    // For now, just simple spawn logic for testing
    if (enemies.length < 5 && Math.random() < 0.02) {
        spawnEnemy();
    }
  });

  const spawnEnemy = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 15; // Spawn outside camera view
    const x = playerPosition.x + Math.cos(angle) * distance;
    const y = playerPosition.y + Math.sin(angle) * distance;
    
    const newEnemy = {
      id: Math.random().toString(),
      typeId: 'street_cats', // Default for testing
      position: [x, y, 0] as [number, number, number]
    };
    
    setEnemies(prev => [...prev, newEnemy]);
  };

  const removeEnemy = (id: string) => {
    setEnemies(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      {enemies.map(e => (
        <Enemy 
          key={e.id}
          {...e}
          onDeath={() => removeEnemy(e.id)}
        />
      ))}
    </>
  );
};

