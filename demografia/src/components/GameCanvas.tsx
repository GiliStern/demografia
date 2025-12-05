import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Suspense } from 'react';

import { Player } from './Player';
import { StarOfDavidWeapon } from './weapons/StarOfDavidWeapon';
import { WaveManager } from './WaveManager';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';

const Ground = () => {
  return (
    <RigidBody type="fixed" friction={1}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </RigidBody>
  );
};

const GameLoop = () => {
    const updateTimer = useGameStore(state => state.updateTimer);
    useFrame((state, delta) => {
        updateTimer(delta);
    });
    return null;
};

export const GameCanvas = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        <color attach="background" args={['#111']} />
        <Suspense fallback={null}>
          <GameLoop />
          <OrthographicCamera
            makeDefault
            position={[0, 0, 10]}
            zoom={40}
            near={0.1}
            far={1000}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          <Physics gravity={[0, 0, 0]}>
            <Ground />
            <Player />
            <StarOfDavidWeapon />
            <WaveManager />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};
