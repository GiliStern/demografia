import { useInstancedSprite, type InstanceData } from "@/hooks/rendering/useInstancedSprite";

// Re-export InstanceData for convenience
export type { InstanceData };

interface InstancedSpriteProps {
  textureUrl: string;
  instances: InstanceData[];
  spriteFrameSize?: number;
  maxInstances?: number;
}

/**
 * InstancedSprite - High-performance sprite rendering using GPU instancing
 * Renders multiple sprites in a single draw call, eliminating texture cloning overhead
 */
export const InstancedSprite = ({
  textureUrl,
  instances,
  spriteFrameSize = 32,
  maxInstances = 200,
}: InstancedSpriteProps) => {
  const { meshRef, material } = useInstancedSprite({
    textureUrl,
    spriteFrameSize,
    instances,
    maxInstances,
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxInstances]}
      material={material}
    >
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};
