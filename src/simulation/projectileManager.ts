/**
 * Projectile Simulation Manager
 *
 * Owns frame-rate projectile state and simulation. Keeps projectile positions,
 * velocity, expiry, and collision resolution in a ref-backed structure instead
 * of Zustand. The store only handles coarse lifecycle (add/remove/clear).
 */

import type { CentralizedProjectile } from "@/types";
import type { ViewportBounds } from "@/types";
import { advanceProjectile } from "@/utils/projectiles/projectileRuntime";
import { reflectInBounds } from "@/utils/weapons/weaponMath";
import type { EnemyPositionMap } from "@/utils/game/waveUtils";

const COLLISION_RADIUS = 0.5;

function enemyEntries(
  enemies: EnemyPositionMap
): [string, { x: number; y: number }][] {
  if (enemies instanceof Map) {
    return Array.from((enemies as ReadonlyMap<string, { x: number; y: number }>).entries());
  }
  const entries: [string, { x: number; y: number }][] = [];
  const record = enemies as Record<string, { x: number; y: number }>;
  for (const id of Object.keys(record)) {
    const pos = record[id];
    if (pos) entries.push([id, pos]);
  }
  return entries;
}

export interface TickContext {
  getEnemyPositions: () => EnemyPositionMap;
  getViewportBounds: () => ViewportBounds | null;
  getPlayerPosition: () => { x: number; y: number };
  damageEnemy: (id: string, damage: number) => void;
}

export interface ProjectileManager {
  addProjectile(projectile: CentralizedProjectile): void;
  addProjectiles(projectiles: CentralizedProjectile[]): void;
  removeProjectile(id: string): void;
  clearProjectiles(): void;
  getSnapshot(): CentralizedProjectile[];
  getMap(): ReadonlyMap<string, CentralizedProjectile>;
  getProjectile(id: string): CentralizedProjectile | undefined;
  getCount(): number;
  tick(delta: number, currentTime: number, ctx: TickContext): void;
}

export function createProjectileManager(): ProjectileManager {
  const projectiles = new Map<string, CentralizedProjectile>();

  return {
    addProjectile(projectile) {
      projectiles.set(projectile.id, { ...projectile });
    },

    addProjectiles(newProjectiles) {
      for (const p of newProjectiles) {
        projectiles.set(p.id, { ...p });
      }
    },

    removeProjectile(id) {
      projectiles.delete(id);
    },

    clearProjectiles() {
      projectiles.clear();
    },

    getSnapshot() {
      return Array.from(projectiles.values());
    },

    getMap() {
      return projectiles as ReadonlyMap<string, CentralizedProjectile>;
    },

    getCount() {
      return projectiles.size;
    },

    getProjectile(id) {
      return projectiles.get(id);
    },

    tick(delta, currentTime, ctx) {
      const { getEnemyPositions, getViewportBounds, getPlayerPosition, damageEnemy } = ctx;
      const toRemove: string[] = [];
      const currentEnemies = getEnemyPositions();
      const viewportBounds = getViewportBounds();
      const playerPosition = getPlayerPosition();

      for (const projectile of projectiles.values()) {
        const age = currentTime - projectile.spawnTime;

        if (age >= projectile.duration) {
          toRemove.push(projectile.id);
          continue;
        }

        let velocity = projectile.velocity;
        if (
          projectile.behaviorType === "bounce" &&
          viewportBounds
        ) {
          velocity = reflectInBounds(
            { x: projectile.position.x, y: projectile.position.y },
            projectile.velocity,
            playerPosition,
            viewportBounds.halfWidth,
            viewportBounds.halfHeight
          );
        }

        const projectileWithVel = { ...projectile, velocity };
        const nextState = advanceProjectile(projectileWithVel, delta);
        const newPosition = nextState.position;

        let hitEnemy = false;
        for (const [enemyId, enemyPos] of enemyEntries(currentEnemies)) {
          const dx = newPosition.x - enemyPos.x;
          const dy = newPosition.y - enemyPos.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < COLLISION_RADIUS * COLLISION_RADIUS) {
            damageEnemy(enemyId, projectile.damage);
            toRemove.push(projectile.id);
            hitEnemy = true;
            break;
          }
        }

        if (!hitEnemy) {
          const existing = projectiles.get(projectile.id);
          if (existing) {
            projectiles.set(projectile.id, {
              ...existing,
              position: newPosition,
              velocity: nextState.velocity,
            });
          }
        }
      }

      for (const id of toRemove) {
        projectiles.delete(id);
      }
    },
  };
}

let globalManager: ProjectileManager | null = null;

export function getProjectileManager(): ProjectileManager {
  return (globalManager ??= createProjectileManager());
}

export function resetProjectileManager(): void {
  if (globalManager) {
    globalManager.clearProjectiles();
  }
}
