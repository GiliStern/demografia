import { useCallback } from "react";
import { getProjectileTickContext } from "@/store/gameStoreAccess";
import { getProjectileManager } from "@/simulation/projectileManager";
import { useBatchedInstancing } from "@/hooks/rendering/useBatchedInstancing";
import { InstancedSprite } from "./InstancedSprite";
import {
  batchEntitiesByTexture,
  type BatchableEntity,
  type EntityInstance,
} from "@/utils/performance/entityBatcher";
import type { CentralizedProjectile } from "@/types";
import { getSpinningSpriteIndex } from "@/utils/entities/enemyAnimation";

function toBatchable(
  p: CentralizedProjectile,
  currentTime: number
): BatchableEntity {
  const shouldAnimate =
    p.shouldSpin && (p.spriteFrameCount ?? 0) >= 2;
  const spriteIndex = shouldAnimate
    ? getSpinningSpriteIndex(currentTime)
    : p.spriteIndex;

  return {
    id: p.id,
    position: [p.position.x, p.position.y, p.position.z],
    scale: p.scale,
    spriteIndex,
    flipX: p.flipX,
    textureUrl: p.textureUrl,
    spriteFrameSize: p.spriteFrameSize,
  };
}

/**
 * BatchedProjectileRenderer - Centralized high-performance projectile rendering
 *
 * Simulation runs in the projectile manager (ref-backed). This component only
 * runs the manager tick and renders snapshots via GPU instancing. No per-frame
 * Zustand writes or forced React rerenders.
 */
export const BatchedProjectileRenderer = () => {
  const manager = getProjectileManager();

  const getBatches = useCallback(
    ({ delta, currentTime }: { delta: number; currentTime: number }) => {
      manager.tick(delta, currentTime, getProjectileTickContext());
      const snapshot = manager.getSnapshot();
      const batchableEntities = snapshot.map((p) =>
        toBatchable(p, currentTime),
      );
      return batchEntitiesByTexture(batchableEntities);
    },
    [manager],
  );

  const { batchKeys, batchDataRef, spriteSyncRefs } =
    useBatchedInstancing(getBatches);

  return (
    <>
      {batchKeys.map((key) => {
        const data = batchDataRef.current.get(key);
        if (!data) return null;
        return (
          <InstancedSprite
            key={key}
            ref={(r) => {
              if (r) spriteSyncRefs.current.set(key, r);
              else spriteSyncRefs.current.delete(key);
            }}
            textureUrl={data.textureUrl}
            instancesRef={
              data.instancesRef as React.MutableRefObject<
                EntityInstance[] | undefined
              >
            }
            spriteFrameSize={data.spriteFrameSize}
            maxInstances={Math.max(
              200,
              (data.instancesRef.current?.length ?? 0) + 50,
            )}
          />
        );
      })}
    </>
  );
};
