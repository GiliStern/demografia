import { describe, it, expect } from "vitest";
import {
  buildWeaponRuntime,
  shouldFire,
  filterByDuration,
} from "./weaponLifecycle";
import type { PlayerStats, WeaponStats } from "@/types";

const BASE_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  moveSpeed: 1,
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
};

const BASE_WEAPON_STATS: WeaponStats = {
  damage: 10,
  speed: 5,
  cooldown: 1,
  duration: 2,
  area: 1,
  amount: 3,
  pierce: 0,
};

describe("weaponLifecycle", () => {
  describe("buildWeaponRuntime", () => {
    it("applies might multiplier to damage", () => {
      const runtime = buildWeaponRuntime(BASE_WEAPON_STATS, {
        ...BASE_PLAYER_STATS,
        might: 2,
      });
      expect(runtime.damage).toBe(20);
    });

    it("applies cooldown multiplier", () => {
      const runtime = buildWeaponRuntime(BASE_WEAPON_STATS, {
        ...BASE_PLAYER_STATS,
        cooldown: 0.5,
      });
      expect(runtime.cooldown).toBe(0.5);
    });

    it("passes through amount and duration", () => {
      const runtime = buildWeaponRuntime(BASE_WEAPON_STATS, BASE_PLAYER_STATS);
      expect(runtime.amount).toBe(3);
      expect(runtime.duration).toBe(2);
      expect(runtime.speed).toBe(5);
    });
  });

  describe("shouldFire", () => {
    it("returns false when within cooldown", () => {
      expect(shouldFire(1, 0.5, 1)).toBe(false);
      expect(shouldFire(1.4, 0.5, 1)).toBe(false);
    });

    it("returns true when cooldown elapsed", () => {
      expect(shouldFire(1.6, 0.5, 1)).toBe(true);
      expect(shouldFire(2, 0, 1)).toBe(true);
    });

    it("returns true when cooldown is zero", () => {
      expect(shouldFire(0.001, 0, 0)).toBe(true);
    });
  });

  describe("filterByDuration", () => {
    it("keeps items within duration", () => {
      const items = [
        { birth: 0 },
        { birth: 1 },
        { birth: 2 },
      ];
      const result = filterByDuration(items, 3, 2.5);
      expect(result).toHaveLength(3);
    });

    it("removes expired items", () => {
      const items = [
        { birth: 0 },
        { birth: 1 },
        { birth: 2 },
      ];
      const result = filterByDuration(items, 1.5, 3);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ birth: 2 });
    });

    it("returns all when duration is 0", () => {
      const items = [{ birth: 0 }, { birth: 100 }];
      const result = filterByDuration(items, 0, 50);
      expect(result).toHaveLength(2);
    });
  });
});
