import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { getProjectileTickContext } from "@/store/gameStoreAccess";
import { getProjectileManager } from "@/simulation/projectileManager";
import { InstancedSprite } from "./InstancedSprite";
import {
  batchEntitiesByTexture,
  type BatchableEntity,
  type EntityInstance,
} from "@/utils/performance/entityBatcher";
import type { CentralizedProjectile } from "@/types";

function toBatchable(p: CentralizedProjectile): BatchableEntity {
  return {
    id: p.id,
    position: [p.position.x, p.position.y, p.position.z],
    scale: p.scale,
    spriteIndex: p.spriteIndex,
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
  const [batchKeys, setBatchKeys] = useState<string[]>([]);
  const batchDataRef = useRef<
    Map<
      string,
      {
        textureUrl: string;
        spriteFrameSize: number;
        instancesRef: { current: EntityInstance[] };
      }
    >
  >(new Map());

  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);

  const manager = getProjectileManager();

  useFrame((state, frameDelta) => {
    if (isPaused || !isRunning) return;

    const delta =
      frameDelta > 0 && frameDelta < 0.5 ? frameDelta : 0.016;
    const currentTime = state.clock.getElapsedTime();

    manager.tick(delta, currentTime, getProjectileTickContext());

    const snapshot = manager.getSnapshot();
    const batchableEntities = snapshot.map(toBatchable);
    const batches = batchEntitiesByTexture(batchableEntities);

    const keys = batches.map(
      (b) => `${b.textureUrl}::${b.spriteFrameSize ?? 32}`
    );

    setBatchKeys((prev) => {
      const next = new Set([...prev, ...keys]);
      if (next.size === prev.length) return prev;
      return [...next];
    });

    for (const batch of batches) {
      const key = `${batch.textureUrl}::${batch.spriteFrameSize ?? 32}`;
      let data = batchDataRef.current.get(key);
      if (!data) {
        data = {
          textureUrl: batch.textureUrl,
          spriteFrameSize: batch.spriteFrameSize ?? 32,
          instancesRef: { current: [] },
        };
        batchDataRef.current.set(key, data);
      }
      data.instancesRef.current = batch.instances;
    }
  });

  return (
    <>
      {batchKeys.map((key) => {
        const data = batchDataRef.current.get(key);
        if (!data) return null;
        return (
          <InstancedSprite
            key={key}
            textureUrl={data.textureUrl}
            instancesRef={
              data.instancesRef as React.MutableRefObject<
                EntityInstance[] | undefined
              >
            }
            spriteFrameSize={data.spriteFrameSize}
            maxInstances={Math.max(
              200,
              (data.instancesRef.current?.length ?? 0) + 50
            )}
          />
        );
      })}
    </>
  );
};
