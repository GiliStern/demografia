import { useMemo, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { InstancedSprite } from "./InstancedSprite";
import {
  batchEntitiesByTexture,
  type BatchableEntity,
} from "@/utils/performance/entityBatcher";

/**
 * BatchedProjectileRenderer - Centralized high-performance projectile rendering
 *
 * Uses GPU instancing to render ALL projectiles in just a few draw calls instead of
 * creating individual React components for each projectile.
 *
 * Performance Benefits:
 * - 100 projectiles: 100 components + 100 draw calls → 1-3 components + 1-3 draw calls
 * - Eliminates per-projectile React overhead
 * - Eliminates per-projectile physics body overhead
 * - Reduces memory allocations and GC pressure
 */
export const BatchedProjectileRenderer = () => {
  // Subscribe only to size for add/remove operations
  const projectilesSize = useGameStore((state) => state.projectiles.size);
  const removeProjectile = useGameStore((state) => state.removeProjectile);
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const updateProjectiles = useGameStore((state) => state.updateProjectiles);
  const damageEnemy = useGameStore((state) => state.damageEnemy);

  // Force re-render on every frame to get updated positions
  const [forceUpdateCounter, forceUpdate] = useState(0);

  // Convert Map to array (re-fetch when size changes OR when forceUpdate is triggered)
  const projectiles = useMemo(() => {
    return Array.from(useGameStore.getState().projectiles.values());
  }, [projectilesSize, forceUpdateCounter]);

  // Track last elapsed time for manual delta calculation
  const lastElapsedTimeRef = useRef(0);

  // Update projectile positions, handle expiration, and check collisions
  useFrame((state, frameDelta) => {
    if (isPaused || !isRunning) return;

    // Use the delta passed by useFrame (much more reliable than getDelta())
    const delta = frameDelta > 0 && frameDelta < 0.5 ? frameDelta : 0.016;
    const currentTime = state.clock.getElapsedTime();
    lastElapsedTimeRef.current = currentTime;

    // Get fresh projectiles and enemies inside useFrame to avoid stale closures
    const gameState = useGameStore.getState();
    const currentProjectiles = Array.from(gameState.projectiles.values());
    const currentEnemies = gameState.enemiesPositions;

    // Batch updates to minimize re-renders
    const toRemove: string[] = [];
    const toUpdate: {
      id: string;
      position: { x: number; y: number; z: number };
    }[] = [];

    // Update all projectiles
    for (const projectile of currentProjectiles) {
      const age = currentTime - projectile.spawnTime;

      // Remove expired projectiles
      if (age >= projectile.duration) {
        toRemove.push(projectile.id);
        continue;
      }

      // Update position based on velocity
      const newPosition = {
        x: projectile.position.x + projectile.velocity.x * delta,
        y: projectile.position.y + projectile.velocity.y * delta,
        z: projectile.position.z + (projectile.velocity.z ?? 0) * delta,
      };

      // Check collision with enemies
      const collisionRadius = 0.5;
      let hitEnemy = false;

      for (const [enemyId, enemyPos] of Object.entries(currentEnemies)) {
        if (
          !enemyPos ||
          typeof enemyPos !== "object" ||
          !("x" in enemyPos) ||
          !("y" in enemyPos)
        )
          continue;

        const dx = newPosition.x - (enemyPos as { x: number; y: number }).x;
        const dy = newPosition.y - (enemyPos as { x: number; y: number }).y;
        const distSq = dx * dx + dy * dy;

        if (distSq < collisionRadius * collisionRadius) {
          // Apply damage to enemy via callback system
          damageEnemy(enemyId, projectile.damage);
          
          toRemove.push(projectile.id);
          hitEnemy = true;
          break;
        }
      }

      if (!hitEnemy) {
        toUpdate.push({ id: projectile.id, position: newPosition });
      }
    }

    // Apply all updates
    toRemove.forEach((id) => removeProjectile(id));
    if (toUpdate.length > 0) {
      updateProjectiles(
        toUpdate.map(({ id, position }) => ({ id, updates: { position } }))
      );
      // Force React re-render to pick up new positions
      forceUpdate((n) => n + 1);
    }
  });

  // Convert projectiles to batchable entities
  const batchableEntities: BatchableEntity[] = useMemo(() => {
    return projectiles.map((p) => ({
      id: p.id,
      position: [p.position.x, p.position.y, p.position.z] as [
        number,
        number,
        number
      ],
      scale: p.scale,
      spriteIndex: p.spriteIndex,
      spriteFrameSize: p.spriteFrameSize,
      flipX: p.flipX,
      textureUrl: p.textureUrl,
    }));
  }, [projectiles]);

  // Batch entities by texture for instanced rendering
  const batches = useMemo(() => {
    return batchEntitiesByTexture(batchableEntities);
  }, [batchableEntities]);

  // Render each batch with GPU instancing
  return (
    <>
      {batches.map((batch) => (
        <InstancedSprite
          key={`${batch.textureUrl}_${batch.spriteFrameSize}`}
          textureUrl={batch.textureUrl}
          spriteFrameSize={batch.spriteFrameSize ?? 32}
          instances={batch.instances}
          maxInstances={Math.max(200, batch.instances.length + 50)}
        />
      ))}
    </>
  );
};
