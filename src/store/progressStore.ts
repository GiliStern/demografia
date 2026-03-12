import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Persisted meta progress (coins, future upgrade store currency).
 */
export interface ProgressState {
  coins: number;
}

export interface ProgressActions {
  addCoins: (amount: number) => void;
}

export type ProgressStore = ProgressState & ProgressActions;

const STORAGE_KEY = "demografia-progress";
const STORAGE_VERSION = 1;

const defaultState: ProgressState = {
  coins: 0,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      ...defaultState,

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ coins: state.coins }),
    },
  ),
);
