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

/** Returns true if the segment from (x0,y0) to (x1,y1) intersects the circle at (cx,cy) with radius r. */
function segmentIntersectsCircle(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const dSq = (cx - x0) ** 2 + (cy - y0) ** 2;
    return dSq <= r * r;
  }
  const t = Math.max(0, Math.min(1, ((cx - x0) * dx + (cy - y0) * dy) / lenSq));
  const nx = x0 + t * dx;
  const ny = y0 + t * dy;
  const distSq = (cx - nx) ** 2 + (cy - ny) ** 2;
  return distSq <= r * r;
}

function enemyEntries(
  enemies: EnemyPositionMap,
): [string, { x: number; y: number }][] {
  if (enemies instanceof Map) {
    return Array.from(
      (enemies as ReadonlyMap<string, { x: number; y: number }>).entries(),
    );
  }
  const entries: [string, { x: number; y: number }][] = [];
  const record = enemies as Record<string, { x: number; y: number }>;
  for (const id of Object.keys(record)) {
    const pos = record[id];
    if (pos) entries.push([id, pos]);
  }
  return entries;
}

export interface ApplyEnemyHitParams {
  enemyId: string;
  damage: number;
  knockback: number;
  hitDir: { x: number; y: number };
}

export interface TickContext {
  getEnemyPositions: () => EnemyPositionMap;
  getViewportBounds: () => ViewportBounds | null;
  getPlayerPosition: () => { x: number; y: number };
  applyEnemyHit: (params: ApplyEnemyHitParams) => void;
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
      const {
        getEnemyPositions,
        getViewportBounds,
        getPlayerPosition,
        applyEnemyHit,
      } = ctx;
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
        if (projectile.behaviorType === "bounce" && viewportBounds) {
          velocity = reflectInBounds(
            { x: projectile.position.x, y: projectile.position.y },
            projectile.velocity,
            playerPosition,
            viewportBounds.halfWidth,
            viewportBounds.halfHeight,
          );
        }

        const projectileWithVel = { ...projectile, velocity };
        const nextState = advanceProjectile(projectileWithVel, delta);
        const newPosition = nextState.position;

        const x0 = projectile.position.x;
        const y0 = projectile.position.y;
        const x1 = newPosition.x;
        const y1 = newPosition.y;

        let hitEnemy = false;
        let shouldRemoveOnHit = false;
        for (const [enemyId, enemyPos] of enemyEntries(currentEnemies)) {
          if (
            segmentIntersectsCircle(
              x0,
              y0,
              x1,
              y1,
              enemyPos.x,
              enemyPos.y,
              COLLISION_RADIUS,
            )
          ) {
            const vx = projectile.velocity.x;
            const vy = projectile.velocity.y;
            const len = Math.sqrt(vx * vx + vy * vy);
            const hitDir =
              len > 0.01
                ? { x: vx / len, y: vy / len }
                : {
                    x: enemyPos.x - projectile.position.x,
                    y: enemyPos.y - projectile.position.y,
                  };
            const hitDirLen = Math.sqrt(
              hitDir.x * hitDir.x + hitDir.y * hitDir.y,
            );
            const normalizedHitDir =
              hitDirLen > 0.01
                ? { x: hitDir.x / hitDirLen, y: hitDir.y / hitDirLen }
                : { x: 1, y: 0 };
            applyEnemyHit({
              enemyId,
              damage: projectile.damage,
              knockback: projectile.knockback ?? 0,
              hitDir: normalizedHitDir,
            });
            hitEnemy = true;
            const pierceLeft = (projectile.pierce ?? 0) - 1;
            if (pierceLeft < 0) {
              shouldRemoveOnHit = true;
            }
            break;
          }
        }

        if (shouldRemoveOnHit) {
          toRemove.push(projectile.id);
        } else if (hitEnemy) {
          const existing = projectiles.get(projectile.id);
          if (existing) {
            projectiles.set(projectile.id, {
              ...existing,
              position: newPosition,
              velocity: nextState.velocity,
              pierce: (existing.pierce ?? 0) - 1,
            });
          }
        } else {
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
