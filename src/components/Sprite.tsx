import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

interface SpriteProps {
  textureName?: string | undefined;
  textureUrl?: string | undefined;
  index: number;
  flipX?: boolean;
  scale?: number;
  spriteFrameSize?: number;
}

const TEXTURE_PATHS: Record<string, string> = {
  characters: "/assets/sprites/characters_32x32.png",
  enemies: "/assets/sprites/enemies_32x32.png",
  weapons: "/assets/sprites/weapons_32x32.png",
  items: "/assets/sprites/items_32x32.png",
  ui: "/assets/sprites/ui_32x32.png",
};

export const Sprite = ({
  textureName,
  textureUrl,
  index,
  flipX = false,
  scale = 1,
  spriteFrameSize = 32,
}: SpriteProps) => {
  const path = textureUrl || (textureName ? TEXTURE_PATHS[textureName] : "");

  if (!path) return null;

  // Preload all textures in a real app, here we lazy load
  const texture = useTexture(path);

  const spriteTexture = useMemo(() => {
    const t = texture.clone();
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [texture]);

  useFrame(() => {
    if (!spriteTexture.image) return;

    const image = spriteTexture.image as HTMLImageElement;
    const w = image.width;
    const h = image.height;
    const cols = Math.floor(w / spriteFrameSize);
    const rows = Math.floor(h / spriteFrameSize);

    const col = index % cols;
    const row = Math.floor(index / cols);

    // Calculate UVs
    // Y needs to be inverted because Three.js 0 is bottom

    if (flipX) {
      spriteTexture.repeat.set(-1 / cols, 1 / rows);
      // If flipped, offset needs to point to the right edge of the frame
      spriteTexture.offset.set((col + 1) / cols, 1 - (row + 1) / rows);
    } else {
      spriteTexture.repeat.set(1 / cols, 1 / rows);
      spriteTexture.offset.set(col / cols, 1 - (row + 1) / rows);
    }
  });

  return (
    <mesh scale={[scale, scale, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={spriteTexture}
        transparent
        alphaTest={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
