import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSessionStore } from "@/store/sessionStore";
import type { EntityBatch, EntityInstance } from "@/utils/performance/entityBatcher";
import type { InstancedSpriteHandle } from "@/components/InstancedSprite";

export interface BatchData {
  textureUrl: string;
  spriteFrameSize: number;
  instancesRef: { current: EntityInstance[] };
}

export interface BatchFrameContext {
  delta: number;
  currentTime: number;
}

/**
 * Shared batch management for GPU-instanced sprite rendering.
 * Eliminates duplicated batchKeysRef/setBatchKeys, batchDataRef, spriteSyncRefs,
 * and the update/sync loop patterns across BatchedEnemyRenderer and BatchedProjectileRenderer.
 *
 * @param getBatches - Called each frame with delta and currentTime; returns batches to render.
 * @returns batchKeys, batchDataRef, spriteSyncRefs for rendering InstancedSprite components.
 */
export function useBatchedInstancing(
  getBatches: (ctx: BatchFrameContext) => EntityBatch[],
) {
  const batchKeysRef = useRef<Set<string>>(new Set());
  const [batchKeys, setBatchKeys] = useState<string[]>([]);
  const spriteSyncRefs = useRef<Map<string, InstancedSpriteHandle>>(new Map());
  const batchDataRef = useRef<Map<string, BatchData>>(new Map());

  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);

  useFrame((state, frameDelta) => {
    if (isPaused || !isRunning) return;

    const delta =
      frameDelta > 0 && frameDelta < 0.5 ? frameDelta : 0.016;
    const currentTime = state.clock.getElapsedTime();
    const batches = getBatches({ delta, currentTime });

    const keys = batches.map(
      (b) => `${b.textureUrl}::${b.spriteFrameSize ?? 32}`,
    );
    const keysSet = new Set(keys);

    let changed = false;
    for (const key of keys) {
      if (!batchKeysRef.current.has(key)) {
        batchKeysRef.current.add(key);
        changed = true;
      }
    }
    for (const key of [...batchKeysRef.current]) {
      if (!keysSet.has(key)) {
        batchKeysRef.current.delete(key);
        batchDataRef.current.delete(key);
        spriteSyncRefs.current.delete(key);
        changed = true;
      }
    }
    if (changed) {
      setBatchKeys([...batchKeysRef.current]);
    }

    const batchByKey = new Map(
      batches.map((b) => [`${b.textureUrl}::${b.spriteFrameSize ?? 32}`, b]),
    );
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
    for (const key of batchKeysRef.current) {
      const data = batchDataRef.current.get(key);
      if (!data) continue;
      if (!batchByKey.has(key)) data.instancesRef.current = [];
      spriteSyncRefs.current.get(key)?.syncMesh();
    }
  });

  return { batchKeys, batchDataRef, spriteSyncRefs };
}
