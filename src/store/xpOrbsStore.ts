import type { StoreCreator, XpOrbsStore, XpOrbData } from "../types";

export const createXpOrbsStore: StoreCreator<XpOrbsStore> = (set) => ({
  xpOrbs: [],

  addXpOrb: (orb: XpOrbData) =>
    set((state: XpOrbsStore) => {
      // CRITICAL FIX: Prevent duplicate IDs from causing infinite re-renders
      if (state.xpOrbs.some((existing: XpOrbData) => existing.id === orb.id)) {
        console.warn(`[XpOrb] Duplicate orb ID prevented: ${orb.id}`);
        return state; // Return unchanged state to prevent re-render
      }
      return {
        xpOrbs: [...state.xpOrbs, orb],
      };
    }),

  removeXpOrb: (id: string) =>
    set((state: XpOrbsStore) => ({
      xpOrbs: state.xpOrbs.filter((orb: XpOrbData) => orb.id !== id),
    })),

  resetXpOrbs: () => set({ xpOrbs: [] }),
});

