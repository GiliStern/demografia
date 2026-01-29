import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { styled } from "@linaria/react";

import { Player } from "./Player";
import { ActiveWeapons } from "./weapons/ActiveWeapons";
import { WaveManager } from "./WaveManager";
import { InfiniteBackground } from "./InfiniteBackground";
import { LevelUpOverlay } from "./LevelUpOverlay";
import { GameLoop } from "./GameLoop";
import { XpOrbsManager } from "./XpOrbsManager";
import { BatchedProjectileRenderer } from "./BatchedProjectileRenderer";
import { VIEWPORT_CONFIG } from "../data/config/viewportConfig";
import { useGameStore } from "@/store/gameStore";

const CanvasContainer = styled.div<{ $menuVisible?: boolean }>`
  width: 100vw;
  height: 100vh;
  position: relative;
  pointer-events: ${({ $menuVisible }) => ($menuVisible ? "none" : "auto")};
`;

interface GameCanvasProps {
  $menuVisible?: boolean;
}

export const GameCanvas = ({ $menuVisible = false }: GameCanvasProps) => {
  const { isPaused, isRunning } = useGameStore();
  const physicsPaused = !isRunning || isPaused;

  return (
    <CanvasContainer $menuVisible={$menuVisible}>
      <Canvas
        shadows={false}
        dpr={1}
        frameloop="always"
        gl={{ antialias: false }}
      >
        <color attach="background" args={["#111"]} />
        <Suspense fallback={null}>
          <GameLoop />
          <OrthographicCamera
            makeDefault
            position={[0, 0, 10]}
            zoom={VIEWPORT_CONFIG.CAMERA_ZOOM}
            near={0.1}
            far={1000}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <InfiniteBackground />
          <Physics gravity={[0, 0, 0]} paused={physicsPaused}>
            <Player />
            <ActiveWeapons />
            <WaveManager />
            <XpOrbsManager />
          </Physics>
          {/* Batched projectile rendering outside physics for performance */}
          <BatchedProjectileRenderer />
        </Suspense>
      </Canvas>
      <LevelUpOverlay />
    </CanvasContainer>
  );
};
