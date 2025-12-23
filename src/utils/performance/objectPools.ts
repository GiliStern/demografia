/**
 * Object Pools - Reusable object pools to eliminate GC pressure
 * Pre-allocates objects and reuses them instead of constant create/destroy
 */

import type { ProjectileData } from "../../types";

/**
 * Generic object pool implementation
 */
class ObjectPool<T> {
  private available: T[] = [];
  private active = new Set<T>();
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor({
    factory,
    reset,
    initialSize = 50,
    maxSize = 200,
  }: {
    factory: () => T;
    reset: (obj: T) => void;
    initialSize?: number;
    maxSize?: number;
  }) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    // Pre-allocate initial pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    let obj = this.available.pop();

    if (!obj) {
      // Pool exhausted, create new object if under max size
      if (this.active.size < this.maxSize) {
        obj = this.factory();
      } else {
        // At capacity, reuse oldest active object
        const oldest = this.active.values().next().value as T;
        this.active.delete(oldest);
        obj = oldest;
      }
    }

    this.active.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.active.has(obj)) return;

    this.active.delete(obj);
    this.reset(obj);

    // Only add back to pool if under max size
    if (this.available.length + this.active.size < this.maxSize) {
      this.available.push(obj);
    }
  }

  /**
   * Release multiple objects at once
   */
  releaseMany(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }

  /**
   * Get number of active objects
   */
  getActiveCount(): number {
    return this.active.size;
  }

  /**
   * Get number of available objects
   */
  getAvailableCount(): number {
    return this.available.length;
  }

  /**
   * Get total pool size
   */
  getTotalSize(): number {
    return this.active.size + this.available.length;
  }
}

/**
 * Projectile Pool - Specialized pool for projectile objects
 */
export class ProjectilePool {
  private pool: ObjectPool<ProjectileData>;

  constructor(initialSize = 100, maxSize = 300) {
    this.pool = new ObjectPool<ProjectileData>({
      factory: () => ({
        id: "",
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        duration: 0,
        damage: 0,
      }),
      reset: (projectile) => {
        projectile.id = "";
        projectile.position.x = 0;
        projectile.position.y = 0;
        projectile.position.z = 0;
        projectile.velocity.x = 0;
        projectile.velocity.y = 0;
        (projectile.velocity as { z?: number }).z = 0;
        projectile.duration = 0;
        projectile.damage = 0;
      },
      initialSize,
      maxSize,
    });
  }

  /**
   * Acquire a projectile from the pool and initialize it
   */
  acquire(data: ProjectileData): ProjectileData {
    const projectile = this.pool.acquire();

    // Initialize with new data
    projectile.id = data.id;
    projectile.position.x = data.position.x;
    projectile.position.y = data.position.y;
    projectile.position.z = data.position.z;
    projectile.velocity.x = data.velocity.x;
    projectile.velocity.y = data.velocity.y;
    if ("z" in data.velocity && typeof data.velocity.z === "number") {
      (projectile.velocity as { z?: number }).z = data.velocity.z;
    }
    projectile.duration = data.duration;
    projectile.damage = data.damage;

    return projectile;
  }

  /**
   * Release a projectile back to the pool
   */
  release(projectile: ProjectileData): void {
    this.pool.release(projectile);
  }

  /**
   * Release multiple projectiles at once
   */
  releaseMany(projectiles: ProjectileData[]): void {
    this.pool.releaseMany(projectiles);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      active: this.pool.getActiveCount(),
      available: this.pool.getAvailableCount(),
      total: this.pool.getTotalSize(),
    };
  }
}

/**
 * Enemy Pool Data Interface
 */
export interface PooledEnemyData {
  id: string;
  typeId: string;
  position: { x: number; y: number };
  hp: number;
  isActive: boolean;
}

/**
 * Enemy Pool - Specialized pool for enemy objects
 */
export class EnemyPool {
  private pool: ObjectPool<PooledEnemyData>;

  constructor(initialSize = 50, maxSize = 150) {
    this.pool = new ObjectPool<PooledEnemyData>({
      factory: () => ({
        id: "",
        typeId: "",
        position: { x: 0, y: 0 },
        hp: 0,
        isActive: false,
      }),
      reset: (enemy) => {
        enemy.id = "";
        enemy.typeId = "";
        enemy.position.x = 0;
        enemy.position.y = 0;
        enemy.hp = 0;
        enemy.isActive = false;
      },
      initialSize,
      maxSize,
    });
  }

  /**
   * Acquire an enemy from the pool and initialize it
   */
  acquire(data: Omit<PooledEnemyData, "isActive">): PooledEnemyData {
    const enemy = this.pool.acquire();

    enemy.id = data.id;
    enemy.typeId = data.typeId;
    enemy.position.x = data.position.x;
    enemy.position.y = data.position.y;
    enemy.hp = data.hp;
    enemy.isActive = true;

    return enemy;
  }

  /**
   * Release an enemy back to the pool
   */
  release(enemy: PooledEnemyData): void {
    this.pool.release(enemy);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      active: this.pool.getActiveCount(),
      available: this.pool.getAvailableCount(),
      total: this.pool.getTotalSize(),
    };
  }
}

/**
 * XP Orb Pool Data Interface
 */
export interface PooledXpOrbData {
  id: string;
  position: { x: number; y: number };
  xpValue: number;
  isActive: boolean;
}

/**
 * XP Orb Pool - Specialized pool for XP orb objects
 */
export class XpOrbPool {
  private pool: ObjectPool<PooledXpOrbData>;

  constructor(initialSize = 100, maxSize = 200) {
    this.pool = new ObjectPool<PooledXpOrbData>({
      factory: () => ({
        id: "",
        position: { x: 0, y: 0 },
        xpValue: 0,
        isActive: false,
      }),
      reset: (orb) => {
        orb.id = "";
        orb.position.x = 0;
        orb.position.y = 0;
        orb.xpValue = 0;
        orb.isActive = false;
      },
      initialSize,
      maxSize,
    });
  }

  /**
   * Acquire an XP orb from the pool and initialize it
   */
  acquire(data: Omit<PooledXpOrbData, "isActive">): PooledXpOrbData {
    const orb = this.pool.acquire();

    orb.id = data.id;
    orb.position.x = data.position.x;
    orb.position.y = data.position.y;
    orb.xpValue = data.xpValue;
    orb.isActive = true;

    return orb;
  }

  /**
   * Release an XP orb back to the pool
   */
  release(orb: PooledXpOrbData): void {
    this.pool.release(orb);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      active: this.pool.getActiveCount(),
      available: this.pool.getAvailableCount(),
      total: this.pool.getTotalSize(),
    };
  }
}

/**
 * Global pool instances for reuse across the game
 */
export const projectilePool = new ProjectilePool();
export const enemyPool = new EnemyPool();
export const xpOrbPool = new XpOrbPool();
