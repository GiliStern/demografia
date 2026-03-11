import { beforeEach, describe, expect, it } from "vitest";
import { useWeaponsStore } from "./weaponsStore";
import { PassiveId, WeaponId } from "@/types";

describe("weaponsStore derived stats caching", () => {
  beforeEach(() => {
    useWeaponsStore.setState(useWeaponsStore.getInitialState(), true);
  });

  it("getWeaponStats returns updated stats after levelUpWeapon", () => {
    useWeaponsStore.getState().resetWeapons([WeaponId.Sabra]);

    const statsLvl1 = useWeaponsStore.getState().getWeaponStats(WeaponId.Sabra);
    expect(statsLvl1.damage).toBe(5);

    for (let i = 0; i < 4; i++) {
      useWeaponsStore.getState().levelUpWeapon(WeaponId.Sabra);
    }
    const statsLvl5 = useWeaponsStore.getState().getWeaponStats(WeaponId.Sabra);
    expect(statsLvl5.damage).toBeGreaterThan(statsLvl1.damage);
  });

  it("getWeaponStats returns updated stats after addPassive", () => {
    useWeaponsStore.getState().resetWeapons([WeaponId.Sabra]);

    const statsBefore = useWeaponsStore.getState().getWeaponStats(WeaponId.Sabra);
    useWeaponsStore.getState().addPassive(PassiveId.Wassach);
    const statsAfter = useWeaponsStore.getState().getWeaponStats(WeaponId.Sabra);
    expect(statsAfter).toBeDefined();
    expect(statsAfter.cooldown).toBeLessThanOrEqual(statsBefore.cooldown);
  });
});
