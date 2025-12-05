import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useGameStore } from '../store/gameStore';
import { Sprite } from './Sprite';
import * as THREE from 'three';

export const Player = () => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useKeyboardControls();
  const { playerStats, setPlayerPosition, setPlayerDirection, takeDamage } = useGameStore();
  const [isFacingLeft, setFacingLeft] = useState(false);
  const lastDamageTime = useRef(0);

  useFrame((state) => {
    if (!rigidBody.current) return;

    const { x, y } = controls.current;
    
    // Normalize movement vector
    const moveDir = new THREE.Vector3(x, y, 0);
    if (moveDir.length() > 0) {
        moveDir.normalize().multiplyScalar(playerStats.moveSpeed);
        setPlayerDirection(x !== 0 ? Math.sign(x) : (isFacingLeft ? -1 : 1), y !== 0 ? Math.sign(y) : 0);
    }
    
    rigidBody.current.setLinvel({ x: moveDir.x, y: moveDir.y, z: 0 }, true);
    
    // Update store position
    const translation = rigidBody.current.translation();
    setPlayerPosition(translation.x, translation.y);
    
    // Camera follow
    // Smooth lerp could be added here, but direct set is fine for pixel perfect
    state.camera.position.set(translation.x, translation.y, 10);
    
    // Facing direction
    if (x < 0 && !isFacingLeft) setFacingLeft(true);
    if (x > 0 && isFacingLeft) setFacingLeft(false);
  });

  const handleIntersection = (payload: any) => {
     const now = Date.now();
     // Invulnerability frame of 500ms
     if (now - lastDamageTime.current < 500) return;

     if (payload.other.rigidBodyObject?.userData) {
         const userData = payload.other.rigidBodyObject.userData as any;
         if (userData.type === 'enemy') {
             takeDamage(10); // Base damage from enemy
             lastDamageTime.current = now;
             // Visual feedback needed here
         }
     }
  };

  return (
    <RigidBody 
      ref={rigidBody} 
      colliders={false} 
      lockRotations 
      position={[0, 0, 0]}
      type="dynamic"
      friction={0}
      userData={{ type: 'player' }}
      onIntersectionEnter={handleIntersection}
    >
      <CuboidCollider args={[0.3, 0.3, 1]} />
      <Sprite 
        textureName="characters" 
        index={0} 
        flipX={isFacingLeft}
      />
    </RigidBody>
  );
};

