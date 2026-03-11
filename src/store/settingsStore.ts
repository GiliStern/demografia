import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { applyMusicMuted } from "../utils/assets/audioManager";

/**
 * Persisted user settings. Add new settings here and extend the
 * partialize/merge logic if you need migration or selective persistence.
 */
export interface SettingsState {
  musicMuted: boolean;
  sfxMuted: boolean;
  // Future: sfxVolume, musicVolume, language, fullscreen, etc.
}

export interface SettingsActions {
  setMusicMuted: (muted: boolean) => void;
  setSfxMuted: (muted: boolean) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const STORAGE_KEY = "demografia-settings";
const STORAGE_VERSION = 1;

const defaultState: SettingsState = {
  musicMuted: false,
  sfxMuted: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setMusicMuted: (muted) => {
        set({ musicMuted: muted });
        applyMusicMuted(muted);
      },
      setSfxMuted: (muted) => {
        set({ sfxMuted: muted });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state,
    },
  ),
);
