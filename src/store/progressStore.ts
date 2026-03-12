import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const HIGHSCORE_TABLE_SIZE = 5;

export interface HighScoreEntry {
  time: number;
  killCount: number;
  gold: number;
}

/**
 * Persisted meta progress (coins, future upgrade store currency).
 */
export interface ProgressState {
  coins: number;
  highScores: HighScoreEntry[];
}

export interface ProgressActions {
  addCoins: (amount: number) => void;
  addHighScore: (entry: HighScoreEntry) => boolean;
}

export type ProgressStore = ProgressState & ProgressActions;

const STORAGE_KEY = "demografia-progress";
const STORAGE_VERSION = 2;

const defaultState: ProgressState = {
  coins: 0,
  highScores: [],
};

function compareEntries(a: HighScoreEntry, b: HighScoreEntry): number {
  if (a.time !== b.time) return b.time - a.time;
  if (a.killCount !== b.killCount) return b.killCount - a.killCount;
  return b.gold - a.gold;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      addHighScore: (entry) => {
        const { highScores } = get();
        const fifth = highScores[HIGHSCORE_TABLE_SIZE - 1];
        const wasInTable =
          highScores.length < HIGHSCORE_TABLE_SIZE ||
          (fifth !== undefined && compareEntries(entry, fifth) <= 0);
        const merged = [...highScores, entry].sort(compareEntries);
        const trimmed = merged.slice(0, HIGHSCORE_TABLE_SIZE);
        set({ highScores: trimmed });
        return wasInTable;
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        coins: state.coins,
        highScores: state.highScores,
      }),
      migrate: (persisted) => {
        const p = persisted as Partial<ProgressState> | undefined;
        return {
          coins: p?.coins ?? 0,
          highScores: p?.highScores ?? [],
        };
      },
    },
  ),
);
