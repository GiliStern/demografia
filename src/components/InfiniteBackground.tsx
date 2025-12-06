import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useGameStore } from "../hooks/useGameStore";
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

  useFrame(() => {
    const { x, y } = useGameStore.getState().playerPosition;

    const map = materialRef.current?.map;
    if (!map) return;

    const { offsetX, offsetY } = getRepeatedTextureOffsets({
      x,
      y,
      gridUnitSize: GRID_UNIT_SIZE,
    });

    // Scroll opposite to player position so world appears to move underfoot
    map.offset.set(offsetX, offsetY);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <planeGeometry args={[BG_PLANE_SIZE, BG_PLANE_SIZE]} />
      <meshBasicMaterial ref={materialRef} map={texture} />
    </mesh>
  );
};
