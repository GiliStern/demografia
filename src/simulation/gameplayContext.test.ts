import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getGameplayContext,
  setGameplayContext,
  resetGameplayContext,
  type GameplayContext,
} from "./gameplayContext";
import { createEnemyManager } from "./enemyManager";
import { EnemyId } from "@/types";
import { getEnemy } from "@/data/config/enemiesNormalized";

describe("gameplayContext", () => {
  beforeEach(() => {
    setGameplayContext(null);
  });

  it("allows injecting a fake context for testing", () => {
    const fakeCtx: GameplayContext = {
      getPlayerPosition: () => ({ x: 10, y: 20 }),
      getPlayerDirection: () => ({ x: 1, y: 0 }),
      getEffectivePlayerStats: () =>
        ({
          maxHealth: 100,
          moveSpeed: 5,
          might: 1,
          area: 1,
          cooldown: 1,
          recovery: 0,
          luck: 0,
          growth: 0,
          greed: 0,
          curse: 0,
          revivals: 0,
          armor: 0,
          magnet: 0,
        }) as import("@/types").PlayerStats,
      getWeaponStats: () =>
        ({
          damage: 5,
          amount: 1,
          speed: 10,
          duration: 2,
          pierce: 0,
          knockback: 1,
        }) as import("@/types").WeaponStats,
      getEnemyPositions: () => new Map(),
      getViewportBounds: () => null,
      getCullDistance: () => 9999,
      getSessionState: () => ({ isRunning: true, isPaused: false }),
      addProjectiles: vi.fn(),
      applyDamageToEnemy: vi.fn(),
      reportContactDamage: vi.fn(),
      getProjectileTickContext: () => ({
        getEnemyPositions: () => new Map(),
        getMeterPositions: () => new Map(),
        getViewportBounds: () => null,
        getPlayerPosition: () => ({ x: 10, y: 20 }),
        applyEnemyHit: vi.fn(),
        onMeterHit: vi.fn(),
      }),
      getEnemyTickContext: () => ({
        getPlayerPosition: () => ({ x: 10, y: 20 }),
        getViewportBounds: () => null,
        getCullDistance: () => 9999,
        reportContactDamage: vi.fn(),
      }),
    };

    setGameplayContext(fakeCtx);
    const ctx = getGameplayContext();
    expect(ctx.getPlayerPosition()).toEqual({ x: 10, y: 20 });
  });

  it("fake context can drive EnemyManager tick", () => {
    const manager = createEnemyManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    if (!enemyData) throw new Error("Enemy data not found");

    manager.spawnEnemy("e1", EnemyId.StreetCats, { x: 0, y: 0 }, enemyData);
    manager.applyDamage("e1", 10);

    const reportContactDamage = vi.fn();
    const tickCtx = {
      getPlayerPosition: () => ({ x: 0, y: 0 }),
      getViewportBounds: () => null,
      getCullDistance: () => 9999,
      reportContactDamage,
    };

    const deathEvents = manager.tick(0.016, 0, tickCtx);
    expect(deathEvents).toHaveLength(1);
    expect(deathEvents[0]!.id).toBe("e1");
  });

  it("resetGameplayContext causes next getGameplayContext to return a fresh instance", () => {
    const ctx1 = getGameplayContext();
    resetGameplayContext();
    const ctx2 = getGameplayContext();
    expect(ctx1).not.toBe(ctx2);
  });
});
