import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { Sprite } from './Sprite';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import enemiesData from '../data/enemies.json';

interface EnemyProps {
  id: string;
  typeId: string;
  position: [number, number, number];
  onDeath: () => void;
}

export const Enemy = ({ id, typeId, position, onDeath }: EnemyProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const { playerPosition, isPaused, addXp, addGold } = useGameStore();
  const [isFacingLeft, setFacingLeft] = useState(false);
  
  // Load stats from data
  // @ts-ignore
  const data = enemiesData[typeId];
  const speed = data?.stats.speed || 2;
  const maxHp = data?.stats.hp || 10;
  const [hp, setHp] = useState(maxHp);

  const textureName = 'enemies';
  const spriteIndex = data?.sprite_config.index || 0;
  const spriteScale = data?.sprite_config.scale || 1;

  useFrame(() => {
    if (!rigidBody.current || isPaused) return;

    // Simple AI: Move towards player
    const direction = new THREE.Vector3(
      playerPosition.x - rigidBody.current.translation().x,
      playerPosition.y - rigidBody.current.translation().y,
      0
    );
    
    if (direction.length() > 0.1) {
      direction.normalize().multiplyScalar(speed);
      rigidBody.current.setLinvel({ x: direction.x, y: direction.y, z: 0 }, true);
      
      // Face direction
      if (direction.x < 0 && !isFacingLeft) setFacingLeft(true);
      if (direction.x > 0 && isFacingLeft) setFacingLeft(false);
    } else {
       rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  const handleIntersection = (payload: any) => {
      if (payload.other.rigidBodyObject?.userData) {
          const userData = payload.other.rigidBodyObject.userData as any;
          if (userData.type === 'projectile') {
              const damage = userData.damage || 1;
              const newHp = hp - damage;
              setHp(newHp);
              
              // Flash effect could go here
              
              if (newHp <= 0) {
                  addXp(10); // Value from data
                  addGold(1);
                  onDeath();
              }
          }
      }
  };

  return (
    <RigidBody 
      ref={rigidBody} 
      position={position} 
      lockRotations 
      friction={0}
      type="dynamic"
      userData={{ type: 'enemy', id }}
      onIntersectionEnter={handleIntersection}
    >
      <CuboidCollider args={[0.3, 0.3, 1]} />
      <Sprite 
        textureName={textureName} 
        index={spriteIndex} 
        flipX={isFacingLeft}
        scale={spriteScale}
      />
    </RigidBody>
  );
};

