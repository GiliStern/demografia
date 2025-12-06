import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";

import { Player } from "./Player";
import { ActiveWeapons } from "./weapons/ActiveWeapons";
import { WaveManager } from "./WaveManager";
import { useGameStore } from "../store/gameStore";
import { InfiniteBackground } from "./InfiniteBackground";
import { LevelUpOverlay } from "./LevelUpOverlay";

const GameLoop = () => {
  const updateTimer = useGameStore((state) => state.updateTimer);
  useFrame((_state, delta) => {
    updateTimer(delta);
  });
  return null;
};

export const GameCanvas = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows={false} dpr={[1, 1.5]}>
        <color attach="background" args={["#111"]} />
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
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <InfiniteBackground />
          <Physics gravity={[0, 0, 0]}>
            <Player />
            <ActiveWeapons />
            <WaveManager />
          </Physics>
        </Suspense>
      </Canvas>
      <LevelUpOverlay />
    </div>
  );
};
