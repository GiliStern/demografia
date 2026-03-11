import type { StoreCreator } from "../types";
import type { FloatingDamageStore } from "../types/store";

function generateId(): string {
  return `dm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const createFloatingDamageStore: StoreCreator<FloatingDamageStore> = (
  set,
) => ({
  floatingDamageEntries: [],

  addFloatingDamage: (x: number, y: number, damage: number) =>
    set((state) => ({
      floatingDamageEntries: [
        ...state.floatingDamageEntries,
        {
          id: generateId(),
          x,
          y,
          damage,
          createdAt: performance.now() / 1000,
        },
      ],
    })),

  removeFloatingDamage: (id: string) =>
    set((state) => ({
      floatingDamageEntries: state.floatingDamageEntries.filter(
        (e) => e.id !== id,
      ),
    })),

  clearFloatingDamage: () => set({ floatingDamageEntries: [] }),
});
