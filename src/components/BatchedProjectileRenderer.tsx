import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSessionStore } from "@/store/sessionStore";
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
  const batchKeysRef = useRef<Set<string>>(new Set());
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

  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);

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

    let changed = false;
    for (const key of keys) {
      if (!batchKeysRef.current.has(key)) {
        batchKeysRef.current.add(key);
        changed = true;
      }
    }
    if (changed) {
      setBatchKeys([...batchKeysRef.current]);
    }

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
