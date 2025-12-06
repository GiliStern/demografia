import { describe, it, expect } from "vitest";
import { resolveWeaponStats } from "./weaponUtils";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { WeaponId } from "@/types";

describe("resolveWeaponStats", () => {
  it("applies Sabra level bonuses", () => {
    const base = resolveWeaponStats(WEAPONS[WeaponId.Sabra], 1);
    const lvl5 = resolveWeaponStats(WEAPONS[WeaponId.Sabra], 5);
    expect(base.damage).toBe(10);
    expect(lvl5.damage).toBeGreaterThan(base.damage);
    expect(lvl5.amount).toBeGreaterThan(base.amount);
  });

  it("caps at max level", () => {
    const capped = resolveWeaponStats(WEAPONS[WeaponId.Sabra], 20);
    const atMax = resolveWeaponStats(WEAPONS[WeaponId.Sabra], 8);
    expect(capped).toEqual(atMax);
  });
});

