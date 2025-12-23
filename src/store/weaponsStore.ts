import type {
  StoreCreator,
  WeaponsStore,
  PassiveId,
  WeaponId,
  WeaponStats,
} from "../types";
import { WEAPONS } from "../data/config/weaponsConfig";
import { resolveWeaponStats } from "../utils/weapons/weaponUtils";

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
        : { activeItems: [...state.activeItems, passiveId] }
    ),

  getWeaponStats: (weaponId): WeaponStats => {
    const weaponDef = WEAPONS[weaponId];
    const level = get().weaponLevels[weaponId] ?? 1;
    return resolveWeaponStats(weaponDef, level);
  },
});
