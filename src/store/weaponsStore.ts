import type { StoreCreator, WeaponsStore } from "../types";

export const createWeaponsStore: StoreCreator<WeaponsStore> = (set) => ({
  activeWeapons: [],
  activeItems: [],

  resetWeapons: (weaponIds) =>
    set({
      activeWeapons: [...weaponIds],
      activeItems: [],
    }),

  addWeapon: (weaponId) =>
    set((state) =>
      state.activeWeapons.includes(weaponId)
        ? state
        : { activeWeapons: [...state.activeWeapons, weaponId] }
    ),
});
