import type { StoreCreator, XpOrbsStore, XpOrbData } from "../types";

export const createXpOrbsStore: StoreCreator<XpOrbsStore> = (set) => ({
  xpOrbsMap: new Map(),

  addXpOrb: (orb: XpOrbData) =>
    set((state: XpOrbsStore) => {
      const newMap = new Map(state.xpOrbsMap);
      if (newMap.has(orb.id) && process.env.NODE_ENV === "development") {
        console.warn(`[XpOrb] Duplicate orb ID overwritten: ${orb.id}`);
      }
      newMap.set(orb.id, orb);
      return { xpOrbsMap: newMap };
    }),

  removeXpOrb: (id: string) =>
    set((state: XpOrbsStore) => {
      const newMap = new Map(state.xpOrbsMap);
      newMap.delete(id);
      return { xpOrbsMap: newMap };
    }),

  resetXpOrbs: () => set({ xpOrbsMap: new Map() }),
});

