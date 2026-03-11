import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSessionStore } from "@/store/sessionStore";
import { useXpOrbsStore } from "@/store/gameStore";
import { getPlayerPositionSnapshot } from "@/store/gameStoreAccess";
import { getEnemyManager } from "@/simulation/enemyManager";
import { getGameplayContext } from "@/simulation/gameplayContext";
import { buildEnemyDeathRewards } from "@/utils/entities/enemyLifecycle";
import { InstancedSprite } from "./InstancedSprite";
import {
  batchEntitiesByTexture,
  type BatchableEntity,
  type EntityInstance,
} from "@/utils/performance/entityBatcher";
import type { EnemyRuntimeState } from "@/simulation/enemyManager";
import type { InstancedSpriteHandle } from "./InstancedSprite";

function toBatchable(
  e: EnemyRuntimeState,
  playerPos: { x: number; y: number }
): BatchableEntity {
  const flipX = playerPos.x < e.position.x;
  return {
    id: e.id,
    position: [e.position.x, e.position.y, 0],
    scale: e.scale,
    spriteIndex: e.spriteIndex,
    flipX,
    textureUrl: e.textureUrl,
    spriteFrameSize: e.spriteFrameSize,
  };
}

/**
 * BatchedEnemyRenderer - Centralized enemy simulation and rendering.
 * Runs enemy tick (movement, death, contact damage) and renders via GPU instancing.
 * Processes death events for rewards (XP, gold, kills).
 */
export const BatchedEnemyRenderer = () => {
  const batchKeysRef = useRef<Set<string>>(new Set());
  const [batchKeys, setBatchKeys] = useState<string[]>([]);
  const spriteSyncRefs = useRef<Map<string, InstancedSpriteHandle>>(new Map());
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
  const addXpOrb = useXpOrbsStore((state) => state.addXpOrb);
  const addGold = useSessionStore((state) => state.addGold);
  const addKill = useSessionStore((state) => state.addKill);

  const enemyManager = getEnemyManager();
  const tickContext = getGameplayContext().getEnemyTickContext();

  useFrame((state, frameDelta) => {
    if (isPaused || !isRunning) return;

    const delta =
      frameDelta > 0 && frameDelta < 0.5 ? frameDelta : 0.016;
    const currentTime = state.clock.getElapsedTime();

    const deathEvents = enemyManager.tick(delta, currentTime, tickContext);

    for (const ev of deathEvents) {
      if (ev.wasCulled) continue;
      const rewards = buildEnemyDeathRewards({
        position: ev.position,
        xpValue: ev.xpDrop,
      });
      addXpOrb(rewards.xpOrb);
      addGold(rewards.goldReward);
      if (rewards.killIncrement > 0) {
        addKill();
      }
    }

    const snapshot = enemyManager.getSnapshot();
    const playerPos = getPlayerPositionSnapshot();
    const batchableEntities = snapshot.map((e) => toBatchable(e, playerPos));
    const batches = batchEntitiesByTexture(batchableEntities);

    const keys = batches.map(
      (b) => `${b.textureUrl}::${b.spriteFrameSize ?? 32}`
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
              (data.instancesRef.current?.length ?? 0) + 50
            )}
          />
        );
      })}
    </>
  );
};
