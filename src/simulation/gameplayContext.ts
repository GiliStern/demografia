/**
 * GameplayContext - Explicit, injectable facade for simulation systems.
 * Replaces ad-hoc multi-store access with a single abstraction.
 * Use getGameplayContext() in production; setGameplayContext() for tests.
 */

import type { CentralizedProjectile, ViewportBounds } from "@/types";
import type { PlayerStats } from "@/types";
import type { EnemyPositionMap } from "@/utils/game/waveUtils";
import type { TickContext } from "./projectileManager";
import type { EnemyTickContext } from "./enemyManager";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import { useSessionStore } from "@/store/sessionStore";
import { useWeaponsStore } from "@/store/weaponsStore";
import { getEnemyManager } from "./enemyManager";
import { createContactDamageReporter } from "./enemyManager";
import { getCullDistance } from "@/utils/rendering/viewportBounds";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";

export interface GameplayContext {
  /** Read APIs */
  getPlayerPosition(): { x: number; y: number };
  getPlayerDirection(): { x: number; y: number };
  getEffectivePlayerStats(): PlayerStats;
  getWeaponStats(weaponId: string): import("@/types").WeaponStats;
  getEnemyPositions(): EnemyPositionMap;
  getViewportBounds(): ViewportBounds | null;
  getCullDistance(): number;
  getSessionState(): { isRunning: boolean; isPaused: boolean };

  /** Command APIs */
  addProjectiles(projectiles: CentralizedProjectile[]): void;
  applyDamageToEnemy(id: string, damage: number): void;
  reportContactDamage(amount: number): void;

  /** Build tick contexts for managers */
  getProjectileTickContext(): TickContext;
  getEnemyTickContext(): EnemyTickContext;
}

function createDefaultGameplayContext(): GameplayContext {
  const contactReporter = createContactDamageReporter((amount) =>
    usePlayerStore.getState().takeDamage(amount),
  );

  return {
    getPlayerPosition: () => usePlayerStore.getState().playerPosition,
    getPlayerDirection: () => usePlayerStore.getState().playerDirection,
    getEffectivePlayerStats: () =>
      usePlayerStore.getState().getEffectivePlayerStats(),
    getWeaponStats: (weaponId) =>
      useWeaponsStore
        .getState()
        .getWeaponStats(weaponId as import("@/types").WeaponId),
    getEnemyPositions: () =>
      getEnemyManager().getEnemyPositions() as EnemyPositionMap,
    getViewportBounds: () => useGameStore.getState().viewportBounds,
    getCullDistance: () => {
      const bounds = useGameStore.getState().viewportBounds;
      return bounds
        ? getCullDistance(bounds, VIEWPORT_CONFIG.ENEMY_CULL_MULTIPLIER)
        : 9999;
    },
    getSessionState: () => ({
      isRunning: useSessionStore.getState().isRunning,
      isPaused: useSessionStore.getState().isPaused,
    }),

    addProjectiles: (projectiles) =>
      useGameStore.getState().addProjectiles(projectiles),
    applyDamageToEnemy: (id, damage) =>
      getEnemyManager().applyDamage(id, damage),
    reportContactDamage: contactReporter,

    getProjectileTickContext: (): TickContext => ({
      getEnemyPositions: () =>
        getEnemyManager().getEnemyPositions() as EnemyPositionMap,
      getViewportBounds: () => useGameStore.getState().viewportBounds,
      getPlayerPosition: () => usePlayerStore.getState().playerPosition,
      applyEnemyHit: ({ enemyId, damage, knockback, hitDir }) => {
        getEnemyManager().applyHit(enemyId, damage, knockback, hitDir);
        const position = getEnemyManager().getEnemyPositions().get(enemyId);
        if (position) {
          useGameStore
            .getState()
            .addFloatingDamage(position.x, position.y, damage);
        }
      },
    }),

    getEnemyTickContext: (): EnemyTickContext => ({
      getPlayerPosition: () => usePlayerStore.getState().playerPosition,
      getViewportBounds: () => useGameStore.getState().viewportBounds,
      getCullDistance: () => {
        const bounds = useGameStore.getState().viewportBounds;
        return bounds
          ? getCullDistance(bounds, VIEWPORT_CONFIG.ENEMY_CULL_MULTIPLIER)
          : 9999;
      },
      reportContactDamage: contactReporter,
    }),
  };
}

let _context: GameplayContext | null = null;

export function getGameplayContext(): GameplayContext {
  _context ??= createDefaultGameplayContext();
  return _context;
}

export function setGameplayContext(ctx: GameplayContext | null): void {
  _context = ctx;
}

/**
 * Resets the gameplay context so the next getGameplayContext() creates a fresh
 * instance. Call when starting a new game to clear internal state (e.g. contact
 * damage throttle) that would otherwise carry over from the previous session.
 */
export function resetGameplayContext(): void {
  _context = null;
}
