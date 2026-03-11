import { create } from "zustand";
import type {
  WeaponsStore,
  PassiveId,
  WeaponId,
  WeaponStats,
  PassiveStatDelta,
} from "../types";
import { WEAPONS } from "../data/config/weaponsConfig";
import { resolveWeaponStats } from "../utils/weapons/weaponUtils";
import {
  accumulatePassiveEffects,
  applyPassivesToWeaponStats,
} from "../utils/passives/passiveUtils";

let weaponStatsCache: Partial<Record<WeaponId, WeaponStats>> = {};
let weaponStatsCacheValid = false;

export const useWeaponsStore = create<WeaponsStore>()((set, get) => ({
  activeWeapons: [],
  activeItems: [],
  weaponLevels: {},
  passiveLevels: {},

  resetWeapons: (weaponIds: WeaponId[]) => {
    weaponStatsCacheValid = false;
    return set({
      activeWeapons: [...weaponIds],
      activeItems: [],
      weaponLevels: weaponIds.reduce<Partial<Record<WeaponId, number>>>(
        (acc, id) => ({ ...acc, [id]: 1 }),
        {}
      ),
      passiveLevels: {},
    });
  },

  addWeapon: (weaponId: WeaponId) => {
    weaponStatsCacheValid = false;
    return set((state: WeaponsStore) =>
      state.activeWeapons.includes(weaponId)
        ? state
        : {
            activeWeapons: [...state.activeWeapons, weaponId],
            weaponLevels: { ...state.weaponLevels, [weaponId]: 1 },
          }
    );
  },

  levelUpWeapon: (weaponId: WeaponId): void => {
    weaponStatsCacheValid = false;
    return set((state: WeaponsStore) => {
      const current = state.weaponLevels[weaponId] ?? 1;
      return {
        weaponLevels: { ...state.weaponLevels, [weaponId]: current + 1 },
      };
    });
  },

  evolveWeapon: (evolvesFrom: WeaponId, weaponId: WeaponId): void => {
    weaponStatsCacheValid = false;
    return set((state: WeaponsStore) => {
      const nextWeapons = [
        ...state.activeWeapons.filter((id) => id !== evolvesFrom),
        weaponId,
      ];
      const nextWeaponLevels = { ...state.weaponLevels, [weaponId]: 1 };
      delete nextWeaponLevels[evolvesFrom];
      return { activeWeapons: nextWeapons, weaponLevels: nextWeaponLevels };
    });
  },

  addPassive: (passiveId: PassiveId): void => {
    weaponStatsCacheValid = false;
    return set((state: WeaponsStore) =>
      state.activeItems.includes(passiveId)
        ? state
        : {
            activeItems: [...state.activeItems, passiveId],
            passiveLevels: { ...state.passiveLevels, [passiveId]: 1 },
          }
    );
  },

  levelUpPassive: (passiveId: PassiveId): void => {
    weaponStatsCacheValid = false;
    return set((state: WeaponsStore) => {
      const current = state.passiveLevels[passiveId] ?? 1;
      return {
        passiveLevels: { ...state.passiveLevels, [passiveId]: current + 1 },
      };
    });
  },

  getWeaponStats: (weaponId): WeaponStats => {
    if (!weaponStatsCacheValid) {
      weaponStatsCache = {};
      weaponStatsCacheValid = true;
    }
    const cached = weaponStatsCache[weaponId];
    if (cached) return cached;

    const weaponDef = WEAPONS[weaponId];
    const level = get().weaponLevels[weaponId] ?? 1;
    const baseStats = resolveWeaponStats(weaponDef, level);
    const passiveEffects = get().getAccumulatedPassiveEffects();
    const stats = applyPassivesToWeaponStats(baseStats, passiveEffects);
    weaponStatsCache[weaponId] = stats;
    return stats;
  },

  getAccumulatedPassiveEffects: (): PassiveStatDelta => {
    const { activeItems, passiveLevels } = get();
    return accumulatePassiveEffects({ activeItems, passiveLevels });
  },
}));
