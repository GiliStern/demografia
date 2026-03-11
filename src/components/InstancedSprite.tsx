import { forwardRef, useImperativeHandle } from "react";
import {
  useInstancedSprite,
  type InstanceData,
} from "@/hooks/rendering/useInstancedSprite";

// Re-export InstanceData for convenience
export type { InstanceData };

interface InstancedSpriteProps {
  textureUrl: string;
  instances?: InstanceData[];
  instancesRef?: React.MutableRefObject<InstanceData[] | undefined>;
  spriteFrameSize?: number;
  maxInstances?: number;
}

export interface InstancedSpriteHandle {
  syncMesh: () => void;
}

/**
 * InstancedSprite - High-performance sprite rendering using GPU instancing.
 * Use instancesRef for frame-rate updates without React rerenders.
 * When used with a ref, exposes syncMesh() so the parent can update the mesh in the same frame after setting instancesRef.current.
 */
export const InstancedSprite = forwardRef<
  InstancedSpriteHandle,
  InstancedSpriteProps
>(function InstancedSprite(
  {
    textureUrl,
    instances,
    instancesRef,
    spriteFrameSize = 32,
    maxInstances = 200,
  },
  ref,
) {
  const { meshRef, material, syncMeshNow } = useInstancedSprite({
    textureUrl,
    spriteFrameSize,
    ...(instancesRef
      ? { instancesRef }
      : instances !== undefined
        ? { instances }
        : {}),
    maxInstances,
  });

  useImperativeHandle(ref, () => ({ syncMesh: syncMeshNow }), [syncMeshNow]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxInstances]}
      material={material}
    >
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
});
