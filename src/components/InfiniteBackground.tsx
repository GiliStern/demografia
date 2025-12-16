import { useEffect, useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useGameStore } from "../hooks/useGameStore";
import { usePauseAwareFrame } from "../hooks/usePauseAwareFrame";
import { bg } from "@/assets/assetPaths";
import {
  getRepeatedTextureOffsets,
  setupRepeatingTexture,
} from "../utils/background";

const GRID_UNIT_SIZE = 20; // 1 world unit ~= 32px tile in art direction
const BG_PLANE_SIZE = 80;

export const InfiniteBackground = () => {
  const texture = useTexture(bg.telAvivLoop);
  // Unlit material keeps the background cheap to render (no lighting/shadows).
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    setupRepeatingTexture({
      texture,
      planeSize: BG_PLANE_SIZE,
      gridUnitSize: GRID_UNIT_SIZE,
    });
  }, [texture]);

  usePauseAwareFrame(() => {
    const { playerPosition } = useGameStore.getState();

    const map = materialRef.current?.map;
    if (!map) return;

    const { offsetX, offsetY } = getRepeatedTextureOffsets({
      x: playerPosition.x,
      y: playerPosition.y,
      gridUnitSize: GRID_UNIT_SIZE,
    });

    // Scroll opposite to player position so world appears to move underfoot
    map.offset.set(offsetX, offsetY);

    // Keep background centered on player so it's always visible
    if (meshRef.current) {
      meshRef.current.position.set(playerPosition.x, playerPosition.y, -2);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <planeGeometry args={[BG_PLANE_SIZE, BG_PLANE_SIZE]} />
      <meshBasicMaterial ref={materialRef} map={texture} />
    </mesh>
  );
};
