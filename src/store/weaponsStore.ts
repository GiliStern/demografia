import type {
  StoreCreator,
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

export const createWeaponsStore: StoreCreator<WeaponsStore> = (set, get) => ({
  activeWeapons: [],
  activeItems: [],
  weaponLevels: {},
  passiveLevels: {},

  resetWeapons: (weaponIds: WeaponId[]) =>
    set({
      activeWeapons: [...weaponIds],
      activeItems: [],
      weaponLevels: weaponIds.reduce<Partial<Record<WeaponId, number>>>(
        (acc, id) => ({ ...acc, [id]: 1 }),
        {}
      ),
      passiveLevels: {},
    }),

  addWeapon: (weaponId: WeaponId) =>
    set((state: WeaponsStore) =>
      state.activeWeapons.includes(weaponId)
        ? state
        : {
            activeWeapons: [...state.activeWeapons, weaponId],
            weaponLevels: { ...state.weaponLevels, [weaponId]: 1 },
          }
    ),

  levelUpWeapon: (weaponId: WeaponId): void =>
    set((state: WeaponsStore) => {
      const current = state.weaponLevels[weaponId] ?? 1;
      return {
        weaponLevels: { ...state.weaponLevels, [weaponId]: current + 1 },
      };
    }),

  addPassive: (passiveId: PassiveId): void =>
    set((state: WeaponsStore) =>
      state.activeItems.includes(passiveId)
        ? state
        : {
            activeItems: [...state.activeItems, passiveId],
            passiveLevels: { ...state.passiveLevels, [passiveId]: 1 },
          }
    ),

  levelUpPassive: (passiveId: PassiveId): void =>
    set((state: WeaponsStore) => {
      const current = state.passiveLevels[passiveId] ?? 1;
      return {
        passiveLevels: { ...state.passiveLevels, [passiveId]: current + 1 },
      };
    }),

  getWeaponStats: (weaponId): WeaponStats => {
    const weaponDef = WEAPONS[weaponId];
    const level = get().weaponLevels[weaponId] ?? 1;
    const baseStats = resolveWeaponStats(weaponDef, level);

    // Apply passive effects to weapon stats
    const passiveEffects = get().getAccumulatedPassiveEffects();
    return applyPassivesToWeaponStats(baseStats, passiveEffects);
  },

  getAccumulatedPassiveEffects: (): PassiveStatDelta => {
    const { activeItems, passiveLevels } = get();
    return accumulatePassiveEffects({ activeItems, passiveLevels });
  },
});
