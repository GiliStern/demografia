import type { StoreCreator, ViewportStore } from "../types";

export const createViewportStore: StoreCreator<ViewportStore> = (set) => ({
  viewportBounds: null,

  updateViewportBounds: (bounds) => set({ viewportBounds: bounds }),
});

