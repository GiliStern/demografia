/**
 * Enemy Manager
 *
 * Centralized enemy simulation - owns positions, HP, movement, and death.
 * Analogous to ProjectileManager. Keeps mutable state outside Zustand.
 * Rendering uses getSnapshot(); projectile collision uses getEnemyPositions.
 */

import type { EnemyId } from "@/types";
import type { EnemyDataRuntime } from "@/data/normalizeConfig";
import type { ViewportBounds } from "@/types";
import { getEnemySpriteIndex } from "@/utils/entities/enemyAnimation";

const CONTACT_RADIUS = 0.5;
const CONTACT_DAMAGE_INTERVAL = 0.5;
const KNOCKBACK_DAMPING = 0.85;
const KNOCKBACK_STRENGTH = 4;
const FLASH_DURATION = 0.1;

export interface EnemyPosition {
  x: number;
  y: number;
}

export interface EnemyRuntimeState {
  id: string;
  typeId: EnemyId;
  position: EnemyPosition;
  hp: number;
  maxHp: number;
  speed: number;
  contactDamage: number;
  xpDrop: number;
  knockbackResistance: number;
  knockbackVelocity: { x: number; y: number };
  flashTimer: number;
  textureUrl: string;
  spriteIndex: number;
  baseSpriteIndex: number;
  spriteFrameSize: number;
  scale: number;
}

export interface EnemyDeathEvent {
  id: string;
  typeId: EnemyId;
  position: EnemyPosition;
  xpDrop: number;
  /** True when removed for being beyond cull distance (no rewards) */
  wasCulled?: boolean;
}

export interface EnemyTickContext {
  getPlayerPosition: () => { x: number; y: number };
  getViewportBounds: () => ViewportBounds | null;
  getCullDistance: () => number;
  /** Throttled internally; call every frame for enemies in contact range */
  reportContactDamage: (amount: number) => void;
}

export interface EnemyManager {
  spawnEnemy(
    id: string,
    typeId: EnemyId,
    position: EnemyPosition,
    enemyData: EnemyDataRuntime,
  ): void;
  applyDamage(id: string, damage: number): void;
  applyHit(
    id: string,
    damage: number,
    knockback: number,
    hitDir: { x: number; y: number },
  ): void;
  removeEnemy(id: string): void;
  clearAll(): void;
  getSnapshot(): EnemyRuntimeState[];
  getEnemyPositions(): ReadonlyMap<string, EnemyPosition>;
  getEnemy(id: string): EnemyRuntimeState | undefined;
  getCount(): number;
  hasEnemy(id: string): boolean;
  /**
   * Runs movement, removes dead enemies, applies contact damage.
   * Returns death events for the caller to process (rewards, XP, etc.).
   */
  tick(
    delta: number,
    currentTime: number,
    ctx: EnemyTickContext,
  ): EnemyDeathEvent[];
}

function createThrottledContactDamage(
  takeDamage: (amount: number) => number | void,
): (amount: number) => void {
  let lastTime = 0;
  let accumulated = 0;
  return (amount: number) => {
    accumulated += amount;
    const now = performance.now() / 1000;
    if (now - lastTime >= CONTACT_DAMAGE_INTERVAL) {
      if (accumulated > 0) {
        takeDamage(accumulated);
        accumulated = 0;
      }
      lastTime = now;
    }
  };
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function createEnemyManager(): EnemyManager {
  const roster = new Map<string, EnemyRuntimeState>();

  return {
    spawnEnemy(id, typeId, position, enemyData) {
      const { stats, spriteConfig } = enemyData;
      const baseIndex = spriteConfig.index ?? 0;
      roster.set(id, {
        id,
        typeId,
        position: { ...position },
        hp: stats.hp,
        maxHp: stats.hp,
        speed: stats.speed,
        contactDamage: stats.damage,
        xpDrop: stats.xpDrop,
        knockbackResistance: stats.knockbackResistance ?? 0,
        knockbackVelocity: { x: 0, y: 0 },
        flashTimer: 0,
        textureUrl: spriteConfig.textureUrl,
        spriteIndex: baseIndex,
        baseSpriteIndex: baseIndex,
        spriteFrameSize: spriteConfig.spriteFrameSize ?? 32,
        scale: spriteConfig.scale,
      });
    },

    applyDamage(id, damage) {
      const enemy = roster.get(id);
      if (!enemy) return;
      const newHp = Math.max(0, enemy.hp - damage);
      enemy.hp = newHp;
    },

    applyHit(id, damage, knockback, hitDir) {
      const enemy = roster.get(id);
      if (!enemy) return;
      const newHp = Math.max(0, enemy.hp - damage);
      enemy.hp = newHp;
      enemy.flashTimer = FLASH_DURATION;
      const effectiveKnockback = Math.max(
        0,
        knockback - enemy.knockbackResistance,
      );
      if (effectiveKnockback > 0) {
        const len = Math.sqrt(hitDir.x * hitDir.x + hitDir.y * hitDir.y);
        const nx = len > 0 ? hitDir.x / len : 1;
        const ny = len > 0 ? hitDir.y / len : 0;
        const impulse = effectiveKnockback * KNOCKBACK_STRENGTH;
        enemy.knockbackVelocity.x += nx * impulse;
        enemy.knockbackVelocity.y += ny * impulse;
      }
    },

    removeEnemy(id) {
      roster.delete(id);
    },

    clearAll() {
      roster.clear();
    },

    getSnapshot() {
      return Array.from(roster.values()).map((e) => ({
        ...e,
        position: { ...e.position },
      }));
    },

    getEnemyPositions() {
      const map = new Map<string, EnemyPosition>();
      for (const [id, e] of roster) {
        map.set(id, { ...e.position });
      }
      return map as ReadonlyMap<string, EnemyPosition>;
    },

    getEnemy(id) {
      return roster.get(id);
    },

    getCount() {
      return roster.size;
    },

    hasEnemy(id) {
      return roster.has(id);
    },

    tick(delta, currentTime, ctx) {
      const {
        getPlayerPosition,
        getViewportBounds,
        getCullDistance,
        reportContactDamage,
      } = ctx;
      const playerPos = getPlayerPosition();
      const viewportBounds = getViewportBounds();
      const cullDistance = getCullDistance();

      const deathEvents: EnemyDeathEvent[] = [];
      const toRemove: string[] = [];

      for (const enemy of roster.values()) {
        if (enemy.hp <= 0) {
          deathEvents.push({
            id: enemy.id,
            typeId: enemy.typeId,
            position: { ...enemy.position },
            xpDrop: enemy.xpDrop,
          });
          toRemove.push(enemy.id);
          continue;
        }

        const dx = playerPos.x - enemy.position.x;
        const dy = playerPos.y - enemy.position.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        const isMoving = len > 0.1;
        if (isMoving) {
          const nx = dx / len;
          const ny = dy / len;
          enemy.position.x += nx * enemy.speed * delta;
          enemy.position.y += ny * enemy.speed * delta;
        }

        enemy.position.x += enemy.knockbackVelocity.x * delta;
        enemy.position.y += enemy.knockbackVelocity.y * delta;
        enemy.knockbackVelocity.x *= KNOCKBACK_DAMPING;
        enemy.knockbackVelocity.y *= KNOCKBACK_DAMPING;

        enemy.flashTimer = Math.max(0, enemy.flashTimer - delta);

        enemy.spriteIndex = getEnemySpriteIndex(
          currentTime,
          enemy.baseSpriteIndex,
          isMoving,
        );

        const distToPlayer = distance(enemy.position, playerPos);
        if (distToPlayer < CONTACT_RADIUS) {
          reportContactDamage(enemy.contactDamage);
        }

        if (viewportBounds) {
          const distFromPlayer = distance(enemy.position, playerPos);
          if (distFromPlayer > cullDistance) {
            deathEvents.push({
              id: enemy.id,
              typeId: enemy.typeId,
              position: { ...enemy.position },
              xpDrop: enemy.xpDrop,
              wasCulled: true,
            });
            toRemove.push(enemy.id);
          }
        }
      }

      for (const id of toRemove) {
        roster.delete(id);
      }

      return deathEvents;
    },
  };
}

let globalManager: EnemyManager | null = null;

export function getEnemyManager(): EnemyManager {
  return (globalManager ??= createEnemyManager());
}

export function resetEnemyManager(): void {
  if (globalManager) {
    globalManager.clearAll();
  }
}

/**
 * Creates a throttled contact damage reporter for use in EnemyTickContext.
 * Pass the result to tick context's reportContactDamage.
 */
export function createContactDamageReporter(
  takeDamage: (amount: number) => number | void,
): (amount: number) => void {
  return createThrottledContactDamage(takeDamage);
}
