import { describe, expect, it } from "vitest";
import { WeaponId, type CentralizedProjectile } from "@/types";
import { createProjectileManager } from "./projectileManager";

const createProjectile = (
  overrides: Partial<CentralizedProjectile> = {},
): CentralizedProjectile => ({
  id: "proj-1",
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 10, y: 0 },
  damage: 5,
  textureUrl: "test.png",
  spriteIndex: 0,
  spriteFrameSize: 32,
  scale: 1,
  spawnTime: 0,
  duration: 10,
  weaponId: WeaponId.Pitas,
  behaviorType: "normal",
  ...overrides,
});

describe("projectileManager", () => {
  describe("pierce", () => {
    it("removes projectile with pierce=0 immediately when it hits an enemy (getSnapshot excludes it same tick)", () => {
      const manager = createProjectileManager();
      const damageCalls: { id: string; damage: number }[] = [];

      manager.addProjectile(
        createProjectile({
          id: "pierce-zero",
          pierce: 0,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 10, y: 0 },
        }),
      );

      const ctx = {
        getEnemyPositions: () => new Map([["enemy-1", { x: 0.5, y: 0 }]]),
        getViewportBounds: () => null,
        getPlayerPosition: () => ({ x: 0, y: 0 }),
        damageEnemy: (id: string, damage: number) => {
          damageCalls.push({ id, damage });
        },
      };

      manager.tick(0.1, 0.1, ctx);

      expect(manager.getCount()).toBe(0);
      expect(manager.getProjectile("pierce-zero")).toBeUndefined();
      expect(damageCalls).toEqual([{ id: "enemy-1", damage: 5 }]);
    });

    it("keeps projectile with pierce=1 after first hit and removes after second hit", () => {
      const manager = createProjectileManager();
      const damageCalls: { id: string; damage: number }[] = [];

      manager.addProjectile(
        createProjectile({
          id: "pierce-one",
          pierce: 1,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 10, y: 0 },
        }),
      );

      const enemyMap = new Map<string, { x: number; y: number }>([
        ["enemy-1", { x: 0.5, y: 0 }],
      ]);
      const ctx = {
        getEnemyPositions: () => enemyMap,
        getViewportBounds: () => null,
        getPlayerPosition: () => ({ x: 0, y: 0 }),
        damageEnemy: (id: string, damage: number) => {
          damageCalls.push({ id, damage });
        },
      };

      manager.tick(0.1, 0.1, ctx);

      expect(manager.getCount()).toBe(1);
      expect(manager.getProjectile("pierce-one")).toBeDefined();
      expect(manager.getProjectile("pierce-one")?.pierce).toBe(0);
      expect(damageCalls).toHaveLength(1);
      expect(damageCalls[0]).toEqual({ id: "enemy-1", damage: 5 });

      enemyMap.delete("enemy-1");
      enemyMap.set("enemy-2", { x: 1.5, y: 0 });
      manager.tick(0.1, 0.2, ctx);

      expect(manager.getCount()).toBe(0);
      expect(manager.getProjectile("pierce-one")).toBeUndefined();
      expect(damageCalls).toHaveLength(2);
      expect(damageCalls[1]).toEqual({ id: "enemy-2", damage: 5 });
    });

    it("uses segment-vs-circle collision so fast projectiles do not tunnel through enemies", () => {
      const manager = createProjectileManager();
      const damageCalls: { id: string; damage: number }[] = [];

      manager.addProjectile(
        createProjectile({
          id: "fast",
          pierce: 0,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 20, y: 0 },
        }),
      );

      const ctx = {
        getEnemyPositions: () => new Map([["e1", { x: 0.5, y: 0 }]]),
        getViewportBounds: () => null,
        getPlayerPosition: () => ({ x: 0, y: 0 }),
        damageEnemy: (id: string, damage: number) => damageCalls.push({ id, damage }),
      };

      manager.tick(0.1, 0.1, ctx);

      expect(manager.getCount()).toBe(0);
      expect(damageCalls).toHaveLength(1);
    });
  });
});
