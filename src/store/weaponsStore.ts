import type { StoreCreator, WeaponsStore, PassiveId, WeaponId } from "../types";
import { WEAPONS } from "../data/config/weaponsConfig";
import { resolveWeaponStats } from "../utils/weaponUtils";

export const createWeaponsStore: StoreCreator<WeaponsStore> = (set, get) => ({
  activeWeapons: [],
  activeItems: [],
  weaponLevels: {},

  resetWeapons: (weaponIds: WeaponId[]) =>
    set({
      activeWeapons: [...weaponIds],
      activeItems: [],
      weaponLevels: weaponIds.reduce<Partial<Record<WeaponId, number>>>(
        (acc, id) => ({ ...acc, [id]: 1 }),
        {}
      ),
    }),

  addWeapon: (weaponId: WeaponId) =>
    set((state) =>
      state.activeWeapons.includes(weaponId)
        ? state
        : {
            activeWeapons: [...state.activeWeapons, weaponId],
            weaponLevels: { ...state.weaponLevels, [weaponId]: 1 },
          }
    ),

  levelUpWeapon: (weaponId: WeaponId) =>
    set((state) => {
      const current = state.weaponLevels[weaponId] ?? 1;
      return {
        weaponLevels: { ...state.weaponLevels, [weaponId]: current + 1 },
      };
    }),

  addPassive: (passiveId: PassiveId) =>
    set((state) =>
      state.activeItems.includes(passiveId)
        ? state
        : { activeItems: [...state.activeItems, passiveId] }
    ),

  getWeaponStats: (weaponId) => {
    const weaponDef = WEAPONS[weaponId];
    const level = get().weaponLevels[weaponId] ?? 1;
    return resolveWeaponStats(weaponDef, level);
  },
});
