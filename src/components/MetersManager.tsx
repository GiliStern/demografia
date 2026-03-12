import { useCallback, useRef } from "react";
import { getMeterManager } from "@/simulation/meterManager";
import { getGameplayContext } from "@/simulation/gameplayContext";
import { getSpawnPositionOutsideViewport } from "@/utils/rendering/viewportBounds";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";
import { METER_CONFIG } from "@/data/config/meters";
import { useBatchedInstancing } from "@/hooks/rendering/useBatchedInstancing";
import { InstancedSprite } from "./InstancedSprite";
import {
  batchEntitiesByTexture,
  type BatchableEntity,
  type EntityInstance,
} from "@/utils/performance/entityBatcher";
import type { MeterRuntimeState } from "@/simulation/meterManager";

const SPAWN_INTERVAL = 1;
const BASE_SPAWN_CHANCE = 0.1;

function toBatchable(m: MeterRuntimeState): BatchableEntity {
  return {
    id: m.id,
    position: [m.position.x, m.position.y, 0],
    scale: METER_CONFIG.sprite_config.scale,
    spriteIndex: METER_CONFIG.sprite_config.index,
    textureUrl: METER_CONFIG.sprite_config.textureUrl,
    spriteFrameSize: METER_CONFIG.sprite_config.spriteFrameSize ?? 64,
  };
}

/**
 * MetersManager - Spawns, culls, and renders parking meters (destructible light sources).
 * Uses object pooling; collision with projectiles handled in projectile tick.
 */
export const MetersManager = () => {
  const meterManager = getMeterManager();
  const spawnTimerRef = useRef(0);

  const getBatches = useCallback(
    ({ delta }: { delta: number; currentTime: number }) => {
      const ctx = getGameplayContext();
      const viewportBounds = ctx.getViewportBounds();
      const playerPosition = ctx.getPlayerPosition();
      const cullDistance = ctx.getCullDistance();
      const luck = ctx.getEffectivePlayerStats().luck;

      if (viewportBounds) {
        spawnTimerRef.current += delta;
        if (spawnTimerRef.current >= SPAWN_INTERVAL) {
          spawnTimerRef.current = 0;
          const spawnChance = Math.min(BASE_SPAWN_CHANCE * luck, 0.5);
          if (Math.random() < spawnChance) {
            const spawnPos = getSpawnPositionOutsideViewport(
              playerPosition,
              viewportBounds,
              VIEWPORT_CONFIG.ENEMY_SPAWN_MARGIN,
            );
            meterManager.spawnMeter(spawnPos);
          }
        }

        const snapshot = meterManager.getSnapshot();
        for (const m of snapshot) {
          const dx = m.position.x - playerPosition.x;
          const dy = m.position.y - playerPosition.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > cullDistance) {
            meterManager.destroyMeter(m.id);
          }
        }
      }

      const snapshot = meterManager.getSnapshot();
      const batchableEntities = snapshot.map(toBatchable);
      return batchEntitiesByTexture(batchableEntities);
    },
    [meterManager],
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
              20,
              (data.instancesRef.current?.length ?? 0) + 10,
            )}
          />
        );
      })}
    </>
  );
};
