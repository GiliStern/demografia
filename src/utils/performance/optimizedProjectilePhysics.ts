/**
 * Optimized Projectile Physics - Simplified collision detection without full physics simulation
 * Uses manual intersection tests with spatial partitioning for better performance
 */

import type { QuadTree, SpatialEntity } from "./spatialPartitioning";

export interface ProjectilePosition {
  x: number;
  y: number;
  z: number;
}

export interface ProjectileVelocity {
  x: number;
  y: number;
  z: number;
}

export interface OptimizedProjectile {
  id: string;
  position: ProjectilePosition;
  velocity: ProjectileVelocity;
  damage: number;
  lifetime: number;
  maxLifetime: number;
  radius: number;
}

export interface CollisionTarget extends SpatialEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
}

/**
 * Update projectile position based on velocity and delta time
 */
export function updateProjectilePosition({
  projectile,
  delta,
}: {
  projectile: OptimizedProjectile;
  delta: number;
}): void {
  projectile.position.x += projectile.velocity.x * delta;
  projectile.position.y += projectile.velocity.y * delta;
  projectile.position.z += projectile.velocity.z * delta;
  projectile.lifetime += delta;
}

/**
 * Check if projectile has expired
 */
export function isProjectileExpired(projectile: OptimizedProjectile): boolean {
  return projectile.lifetime >= projectile.maxLifetime;
}

/**
 * Simple circle-circle collision test
 */
export function checkCircleCollision({
  projectile,
  target,
}: {
  projectile: OptimizedProjectile;
  target: CollisionTarget;
}): boolean {
  const dx = projectile.position.x - target.x;
  const dy = projectile.position.y - target.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = projectile.radius + target.radius;
  return distanceSquared <= radiusSum * radiusSum;
}

/**
 * Check projectile collisions against nearby targets using spatial partitioning
 */
export function checkProjectileCollisions({
  projectile,
  quadTree,
  searchRadius = 5,
}: {
  projectile: OptimizedProjectile;
  quadTree: QuadTree<CollisionTarget>;
  searchRadius?: number;
}): CollisionTarget | null {
  // Query nearby targets
  const nearbyTargets = quadTree.queryCircle(
    { x: projectile.position.x, y: projectile.position.y },
    searchRadius
  );

  // Check collision with each nearby target
  for (const target of nearbyTargets) {
    if (checkCircleCollision({ projectile, target })) {
      return target;
    }
  }

  return null;
}

/**
 * Batch update multiple projectiles
 */
export function updateProjectiles({
  projectiles,
  delta,
  quadTree,
  onCollision,
  onExpire,
}: {
  projectiles: OptimizedProjectile[];
  delta: number;
  quadTree: QuadTree<CollisionTarget>;
  onCollision?: (
    projectile: OptimizedProjectile,
    target: CollisionTarget
  ) => void;
  onExpire?: (projectile: OptimizedProjectile) => void;
}): OptimizedProjectile[] {
  const activeProjectiles: OptimizedProjectile[] = [];

  for (const projectile of projectiles) {
    // Update position
    updateProjectilePosition({ projectile, delta });

    // Check if expired
    if (isProjectileExpired(projectile)) {
      onExpire?.(projectile);
      continue;
    }

    // Check collisions
    const hitTarget = checkProjectileCollisions({ projectile, quadTree });
    if (hitTarget) {
      onCollision?.(projectile, hitTarget);
      continue;
    }

    // Still active
    activeProjectiles.push(projectile);
  }

  return activeProjectiles;
}

/**
 * Create an optimized projectile
 */
export function createOptimizedProjectile({
  id,
  position,
  velocity,
  damage,
  duration,
  radius = 0.2,
}: {
  id: string;
  position: ProjectilePosition;
  velocity: ProjectileVelocity;
  damage: number;
  duration: number;
  radius?: number;
}): OptimizedProjectile {
  return {
    id,
    position: { ...position },
    velocity: { ...velocity },
    damage,
    lifetime: 0,
    maxLifetime: duration,
    radius,
  };
}

/**
 * Bounce projectile off boundaries
 */
export function bounceProjectile({
  projectile,
  bounds,
}: {
  projectile: OptimizedProjectile;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}): void {
  if (
    projectile.position.x <= bounds.minX ||
    projectile.position.x >= bounds.maxX
  ) {
    projectile.velocity.x *= -1;
    projectile.position.x = Math.max(
      bounds.minX,
      Math.min(bounds.maxX, projectile.position.x)
    );
  }

  if (
    projectile.position.y <= bounds.minY ||
    projectile.position.y >= bounds.maxY
  ) {
    projectile.velocity.y *= -1;
    projectile.position.y = Math.max(
      bounds.minY,
      Math.min(bounds.maxY, projectile.position.y)
    );
  }
}

/**
 * Apply homing behavior to projectile
 */
export function applyHoming({
  projectile,
  target,
  homingStrength = 2,
  delta,
}: {
  projectile: OptimizedProjectile;
  target: { x: number; y: number };
  homingStrength?: number;
  delta: number;
}): void {
  const dx = target.x - projectile.position.x;
  const dy = target.y - projectile.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0.1) {
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Apply homing force
    projectile.velocity.x += dirX * homingStrength * delta;
    projectile.velocity.y += dirY * homingStrength * delta;

    // Limit velocity
    const speed = Math.sqrt(
      projectile.velocity.x * projectile.velocity.x +
        projectile.velocity.y * projectile.velocity.y
    );
    const maxSpeed = 20;
    if (speed > maxSpeed) {
      projectile.velocity.x = (projectile.velocity.x / speed) * maxSpeed;
      projectile.velocity.y = (projectile.velocity.y / speed) * maxSpeed;
    }
  }
}
