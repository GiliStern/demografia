import type { StoreCreator, XpOrbsStore, XpOrbData } from "../types";

export const createXpOrbsStore: StoreCreator<XpOrbsStore> = (set) => ({
  xpOrbs: [],

  addXpOrb: (orb: XpOrbData) =>
    set((state) => {
      // CRITICAL FIX: Prevent duplicate IDs from causing infinite re-renders
      if (state.xpOrbs.some((existing) => existing.id === orb.id)) {
        console.warn(`[XpOrb] Duplicate orb ID prevented: ${orb.id}`);
        return state; // Return unchanged state to prevent re-render
      }
      return {
        xpOrbs: [...state.xpOrbs, orb],
      };
    }),

  removeXpOrb: (id: string) =>
    set((state) => ({
      xpOrbs: state.xpOrbs.filter((orb) => orb.id !== id),
    })),

  resetXpOrbs: () => set({ xpOrbs: [] }),
});

