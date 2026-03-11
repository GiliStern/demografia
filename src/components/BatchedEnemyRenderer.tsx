import { useCallback } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { useXpOrbsStore } from "@/store/gameStore";
import { getPlayerPositionSnapshot } from "@/store/gameStoreAccess";
import { getEnemyManager } from "@/simulation/enemyManager";
import { getGameplayContext } from "@/simulation/gameplayContext";
import { buildEnemyDeathRewards } from "@/utils/entities/enemyLifecycle";
import { useBatchedInstancing } from "@/hooks/rendering/useBatchedInstancing";
import { InstancedSprite } from "./InstancedSprite";
import {
  batchEntitiesByTexture,
  type BatchableEntity,
  type EntityInstance,
} from "@/utils/performance/entityBatcher";
import type { EnemyRuntimeState } from "@/simulation/enemyManager";

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
  const addXpOrb = useXpOrbsStore((state) => state.addXpOrb);
  const addGold = useSessionStore((state) => state.addGold);
  const addKill = useSessionStore((state) => state.addKill);

  const enemyManager = getEnemyManager();
  const tickContext = getGameplayContext().getEnemyTickContext();

  const getBatches = useCallback(
    ({ delta, currentTime }: { delta: number; currentTime: number }) => {
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
      return batchEntitiesByTexture(batchableEntities);
    },
    [enemyManager, tickContext, addXpOrb, addGold, addKill],
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
              (data.instancesRef.current?.length ?? 0) + 50
            )}
          />
        );
      })}
    </>
  );
};
