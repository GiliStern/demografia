import { describe, it, expect } from "vitest";
import {
  accumulatePassiveEffects,
  applyPassivesToPlayerStats,
  applyPassivesToWeaponStats,
} from "./passiveUtils";
import { PassiveId } from "@/types";
import type { PlayerStats, WeaponStats, PassiveStatDelta } from "@/types";

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
  knockback: 1,
};

describe("passiveUtils", () => {
  describe("accumulatePassiveEffects", () => {
    it("returns empty deltas when no passives", () => {
      const result = accumulatePassiveEffects({
        activeItems: [],
        passiveLevels: {},
      });
      expect(result.add).toEqual({});
      expect(result.mult).toEqual({});
    });

    it("aggregates effects from multiple passives", () => {
      const result = accumulatePassiveEffects({
        activeItems: [PassiveId.Privilege, PassiveId.Gat],
        passiveLevels: {
          [PassiveId.Privilege]: 1,
          [PassiveId.Gat]: 1,
        },
      });
      expect(result.add).toBeDefined();
      expect(result.mult).toBeDefined();
    });

    it("stacks effects from multiple passives with levels", () => {
      const result = accumulatePassiveEffects({
        activeItems: [PassiveId.Protection, PassiveId.Gat],
        passiveLevels: {
          [PassiveId.Protection]: 2,
          [PassiveId.Gat]: 3,
        },
      });
      expect(result.add?.armor).toBe(2);
      expect(result.mult?.might).toBeCloseTo(1.1 * 1.1 * 1.1);
    });
  });

  describe("applyPassivesToPlayerStats", () => {
    it("applies additive effects first", () => {
      const effects: PassiveStatDelta = {
        add: { maxHealth: 10, armor: 5 },
      };
      const result = applyPassivesToPlayerStats(BASE_PLAYER_STATS, effects);
      expect(result.maxHealth).toBe(110);
      expect(result.armor).toBe(5);
    });

    it("applies multiplicative effects after additive", () => {
      const effects: PassiveStatDelta = {
        mult: { maxHealth: 1.5 },
      };
      const result = applyPassivesToPlayerStats(
        { ...BASE_PLAYER_STATS, maxHealth: 100 },
        effects,
      );
      expect(result.maxHealth).toBe(150);
    });

    it("returns base stats when effects are empty", () => {
      const result = applyPassivesToPlayerStats(BASE_PLAYER_STATS, {});
      expect(result).toEqual(BASE_PLAYER_STATS);
    });
  });

  describe("applyPassivesToWeaponStats", () => {
    it("applies weapon additive effects", () => {
      const effects: PassiveStatDelta = {
        weaponAdd: { damage: 5, speed: 2 },
      };
      const result = applyPassivesToWeaponStats(BASE_WEAPON_STATS, effects);
      expect(result.damage).toBe(15);
      expect(result.speed).toBe(7);
    });

    it("applies weapon multiplicative effects", () => {
      const effects: PassiveStatDelta = {
        weaponMult: { damage: 2 },
      };
      const result = applyPassivesToWeaponStats(BASE_WEAPON_STATS, effects);
      expect(result.damage).toBe(20);
    });

    it("returns base stats when effects are empty", () => {
      const result = applyPassivesToWeaponStats(BASE_WEAPON_STATS, {});
      expect(result).toEqual(BASE_WEAPON_STATS);
    });
  });
});
