import type { StoreCreator, EnemiesStore } from "../types";

export const createEnemiesStore: StoreCreator<EnemiesStore> = (set) => ({
  killCount: 0,

  resetEnemies: () => set({ killCount: 0 }),
  addKill: () => set((state) => ({ killCount: state.killCount + 1 })),
});
