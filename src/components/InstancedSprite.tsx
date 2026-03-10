import { useInstancedSprite, type InstanceData } from "@/hooks/rendering/useInstancedSprite";

// Re-export InstanceData for convenience
export type { InstanceData };

interface InstancedSpriteProps {
  textureUrl: string;
  instances?: InstanceData[];
  instancesRef?: React.MutableRefObject<InstanceData[] | undefined>;
  spriteFrameSize?: number;
  maxInstances?: number;
}

/**
 * InstancedSprite - High-performance sprite rendering using GPU instancing.
 * Use instancesRef for frame-rate updates without React rerenders.
 */
export const InstancedSprite = ({
  textureUrl,
  instances,
  instancesRef,
  spriteFrameSize = 32,
  maxInstances = 200,
}: InstancedSpriteProps) => {
  const { meshRef, material } = useInstancedSprite({
    textureUrl,
    spriteFrameSize,
    ...(instancesRef
      ? { instancesRef }
      : instances !== undefined
        ? { instances }
        : {}),
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
