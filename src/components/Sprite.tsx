import { type SpriteConfig } from "@/types";
import { useTexture } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

interface SpriteProps extends SpriteConfig {
  flipX?: boolean;
}

// Cache for UV calculations - calculated once per texture/frame combo
const uvCache = new Map<string, { repeat: [number, number]; offset: [number, number] }>();

function calculateUVs(
  textureUrl: string,
  imageWidth: number,
  imageHeight: number,
  spriteFrameSize: number,
  index: number,
  flipX: boolean
): { repeat: [number, number]; offset: [number, number] } {
  const cacheKey = `${textureUrl}-${index}-${flipX}`;
  
  if (uvCache.has(cacheKey)) {
    return uvCache.get(cacheKey)!;
  }

  const cols = Math.floor(imageWidth / spriteFrameSize);
  const rows = Math.floor(imageHeight / spriteFrameSize);
  const col = index % cols;
  const row = Math.floor(index / cols);

  let repeat: [number, number];
  let offset: [number, number];

  if (flipX) {
    repeat = [-1 / cols, 1 / rows];
    offset = [(col + 1) / cols, 1 - (row + 1) / rows];
  } else {
    repeat = [1 / cols, 1 / rows];
    offset = [col / cols, 1 - (row + 1) / rows];
  }

  const result = { repeat, offset };
  uvCache.set(cacheKey, result);
  return result;
}

export const Sprite = ({
  textureUrl,
  index,
  flipX = false,
  scale = 1,
  spriteFrameSize = 32,
}: SpriteProps) => {
  const texture = useTexture(textureUrl);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // CRITICAL FIX: Clone texture per sprite so each can have independent UVs
  const spriteTexture = useMemo(() => {
    const cloned = texture.clone();
    cloned.minFilter = THREE.NearestFilter;
    cloned.magFilter = THREE.NearestFilter;
    cloned.colorSpace = THREE.SRGBColorSpace;
    cloned.needsUpdate = true;
    return cloned;
  }, [texture]);

  // Update UVs only when dependencies change
  useEffect(() => {
    if (!spriteTexture.image) return;

    const image = spriteTexture.image as HTMLImageElement;
    const uvData = calculateUVs(
      textureUrl,
      image.width,
      image.height,
      spriteFrameSize,
      index,
      flipX
    );

    // Update this sprite's texture UVs
    spriteTexture.repeat.set(uvData.repeat[0], uvData.repeat[1]);
    spriteTexture.offset.set(uvData.offset[0], uvData.offset[1]);
    spriteTexture.needsUpdate = true;
  }, [spriteTexture, textureUrl, index, flipX, spriteFrameSize]);

  return (
    <mesh scale={[scale, scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        map={spriteTexture}
        transparent
        alphaTest={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
