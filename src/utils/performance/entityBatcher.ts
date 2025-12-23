/**
 * Entity Batcher - Groups entities by sprite type for efficient instanced rendering
 * Reduces draw calls from N entities to 1 per entity type
 */

export interface EntityInstance {
  id: string;
  position: [number, number, number];
  scale: number;
  spriteIndex: number;
  flipX?: boolean | undefined;
}

export interface BatchableEntity extends EntityInstance {
  textureUrl: string;
  spriteFrameSize: number;
}

export interface EntityBatch {
  textureUrl: string;
  spriteFrameSize: number;
  instances: EntityInstance[];
}

/**
 * Groups entities by their texture URL and sprite frame size for batched rendering
 */
export function batchEntitiesByTexture(
  entities: BatchableEntity[]
): EntityBatch[] {
  const batchMap = new Map<string, EntityBatch>();

  for (const entity of entities) {
    const key = `${entity.textureUrl}_${entity.spriteFrameSize}`;
    let batch = batchMap.get(key);

    if (!batch) {
      batch = {
        textureUrl: entity.textureUrl,
        spriteFrameSize: entity.spriteFrameSize,
        instances: [],
      };
      batchMap.set(key, batch);
    }

    batch.instances.push({
      id: entity.id,
      position: entity.position,
      scale: entity.scale,
      spriteIndex: entity.spriteIndex,
      flipX: entity.flipX,
    });
  }

  return Array.from(batchMap.values());
}

/**
 * Optimized batch builder that reuses arrays to minimize GC pressure
 */
export class EntityBatcherOptimized {
  private batchMap = new Map<string, EntityBatch>();

  /**
   * Clears all batches and resets for new frame
   */
  clear(): void {
    // Reuse existing batch objects, just clear their instances
    for (const batch of this.batchMap.values()) {
      batch.instances.length = 0;
    }
  }

  /**
   * Adds an entity to the appropriate batch
   */
  addEntity(entity: BatchableEntity): void {
    const key = `${entity.textureUrl}_${entity.spriteFrameSize}`;
    let batch = this.batchMap.get(key);

    if (!batch) {
      batch = {
        textureUrl: entity.textureUrl,
        spriteFrameSize: entity.spriteFrameSize,
        instances: [],
      };
      this.batchMap.set(key, batch);
    }

    batch.instances.push({
      id: entity.id,
      position: entity.position,
      scale: entity.scale,
      spriteIndex: entity.spriteIndex,
      flipX: entity.flipX,
    });
  }

  /**
   * Gets all batches for rendering
   */
  getBatches(): EntityBatch[] {
    return Array.from(this.batchMap.values()).filter(
      (batch) => batch.instances.length > 0
    );
  }

  /**
   * Gets number of batches (draw calls)
   */
  getBatchCount(): number {
    return this.getBatches().length;
  }

  /**
   * Gets total number of entities across all batches
   */
  getEntityCount(): number {
    let count = 0;
    for (const batch of this.batchMap.values()) {
      count += batch.instances.length;
    }
    return count;
  }
}

/**
 * Global batcher instance for reuse across frames
 */
export const globalEntityBatcher = new EntityBatcherOptimized();
