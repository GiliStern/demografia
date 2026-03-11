import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnemyManager, getEnemyManager } from "./enemyManager";
import { EnemyId } from "@/types";
import { getEnemy } from "@/data/config/enemiesNormalized";

describe("enemyManager", () => {
  beforeEach(() => {
    resetEnemyManager();
  });

  it("spawns, updates position via tick, and removes enemies", () => {
    const manager = getEnemyManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    if (!enemyData) throw new Error("Enemy data not found");

    manager.spawnEnemy("enemy-1", EnemyId.StreetCats, { x: 1, y: 2 }, enemyData);
    expect(manager.getEnemy("enemy-1")?.position).toEqual({ x: 1, y: 2 });
    expect(manager.hasEnemy("enemy-1")).toBe(true);

    const ctx = {
      getPlayerPosition: () => ({ x: 5, y: 8 }),
      getViewportBounds: () => null,
      getCullDistance: () => 9999,
      reportContactDamage: vi.fn(),
    };

    manager.tick(0.1, 0, ctx);
    const afterTick = manager.getEnemy("enemy-1");
    expect(afterTick).toBeDefined();
    expect(afterTick!.position.x).toBeGreaterThan(1);
    expect(afterTick!.position.y).toBeGreaterThan(2);

    manager.removeEnemy("enemy-1");
    expect(manager.getEnemy("enemy-1")).toBeUndefined();
    expect(manager.hasEnemy("enemy-1")).toBe(false);
  });

  it("applyDamage reduces HP and tick emits death events when HP <= 0", () => {
    const manager = getEnemyManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    if (!enemyData) throw new Error("Enemy data not found");

    manager.spawnEnemy("enemy-1", EnemyId.StreetCats, { x: 0, y: 0 }, enemyData);
    expect(manager.getEnemy("enemy-1")?.hp).toBe(5);

    manager.applyDamage("enemy-1", 3);
    expect(manager.getEnemy("enemy-1")?.hp).toBe(2);

    manager.applyDamage("enemy-1", 5);
    const ctx = {
      getPlayerPosition: () => ({ x: 0, y: 0 }),
      getViewportBounds: () => null,
      getCullDistance: () => 9999,
      reportContactDamage: vi.fn(),
    };
    const deathEvents = manager.tick(0.016, 0, ctx);

    expect(deathEvents).toHaveLength(1);
    const ev = deathEvents[0]!;
    expect(ev.id).toBe("enemy-1");
    expect(ev.typeId).toBe(EnemyId.StreetCats);
    expect(ev.xpDrop).toBe(30);
    expect(manager.hasEnemy("enemy-1")).toBe(false);
  });

  it("clearAll removes all enemies", () => {
    const manager = getEnemyManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    if (!enemyData) throw new Error("Enemy data not found");

    manager.spawnEnemy("e1", EnemyId.StreetCats, { x: 0, y: 0 }, enemyData);
    const hipsterData = getEnemy(EnemyId.Hipster);
    if (!hipsterData) throw new Error("Hipster data not found");
    manager.spawnEnemy("e2", EnemyId.Hipster, { x: 1, y: 1 }, hipsterData);

    expect(manager.getCount()).toBe(2);

    manager.clearAll();
    expect(manager.getCount()).toBe(0);
    expect(manager.getEnemyPositions().size).toBe(0);
  });

  it("emits death event when enemy is culled beyond cullDistance", () => {
    const manager = getEnemyManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    if (!enemyData) throw new Error("Enemy data not found");

    manager.spawnEnemy("culled-1", EnemyId.StreetCats, { x: 100, y: 100 }, enemyData);
    const ctx = {
      getPlayerPosition: () => ({ x: 0, y: 0 }),
      getViewportBounds: () => ({
        width: 100,
        height: 100,
        halfWidth: 50,
        halfHeight: 50,
      }),
      getCullDistance: () => 50,
      reportContactDamage: vi.fn(),
    };

    const deathEvents = manager.tick(0.016, 0, ctx);

    expect(deathEvents).toHaveLength(1);
    expect(deathEvents[0]!.id).toBe("culled-1");
    expect(deathEvents[0]!.wasCulled).toBe(true);
    expect(manager.hasEnemy("culled-1")).toBe(false);
  });

  it("getEnemyPositions returns positions for projectile collision", () => {
    const manager = getEnemyManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    if (!enemyData) throw new Error("Enemy data not found");

    manager.spawnEnemy("e1", EnemyId.StreetCats, { x: 10, y: 20 }, enemyData);
    const positions = manager.getEnemyPositions();
    expect(positions.get("e1")).toEqual({ x: 10, y: 20 });
  });
});
