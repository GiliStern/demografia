import { create } from "zustand";
import { getCharacter } from "../data/config/charactersNormalized";
import { FLOOR_PICKUPS } from "../data/config/floorPickups";
import {
  CharacterId,
  PauseReason,
  type UpgradeOption,
  FloorPickupId,
  ItemKind,
} from "../types";
import { useGameStore } from "./gameStore";
import { usePlayerStore } from "./playerStore";
import { useWeaponsStore } from "./weaponsStore";
import { resolveLevelProgression, buildUpgradeChoices } from "./gameStore";
import { resetEnemyManager } from "../simulation/enemyManager";
import { resetMeterManager } from "../simulation/meterManager";
import { resetGameplayContext } from "../simulation/gameplayContext";
import { playMusic, playSfx, stopMusic } from "../utils/assets/audioManager";
import { music, sfx } from "../assets/assetPaths";
import { useSettingsStore } from "./settingsStore";
import { useProgressStore } from "./progressStore";

const MAGNET_PULSE_DURATION = 3;

export interface SessionState {
  isRunning: boolean;
  isPaused: boolean;
  pauseReason: PauseReason;
  isGameOver: boolean;
  gameWon: boolean;
  newHighScore: boolean;
  runTimer: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  pendingLevelUps: number;
  gold: number;
  killCount: number;
  selectedCharacterId: CharacterId;
  upgradeChoices: UpgradeOption[];
  /** When runTimer exceeds this, magnet pulse ends. 0 = no pulse. */
  magnetPulseEndTime: number;
}

const INITIAL_SESSION_STATE: SessionState = {
  isRunning: false,
  isPaused: false,
  pauseReason: PauseReason.None,
  isGameOver: false,
  gameWon: false,
  newHighScore: false,
  runTimer: 0,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  pendingLevelUps: 0,
  gold: 0,
  killCount: 0,
  selectedCharacterId: CharacterId.Srulik,
  upgradeChoices: [],
  magnetPulseEndTime: 0,
};

export interface SessionActions {
  startGame: (characterId: CharacterId) => void;
  resetToMainMenu: () => void;
  addKill: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  endGame: (options?: { won?: boolean }) => void;
  updateTimer: (delta: number) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  levelUp: () => void;
  applyUpgrade: (choice: UpgradeOption) => void;
  resumeFromLevelUp: () => void;
  collectPickup: (
    pickupId: FloorPickupId,
    payload?: { goldAmount?: number },
  ) => void;
}

export type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...INITIAL_SESSION_STATE,

  startGame: (characterId) => {
    const character = getCharacter(characterId);
    if (!character) return;

    usePlayerStore.getState().resetPlayer(characterId);
    const gameStore = useGameStore.getState();
    useWeaponsStore.getState().resetWeapons([character.startingWeaponId]);
    resetEnemyManager();
    resetMeterManager();
    resetGameplayContext();
    gameStore.resetXpOrbs();
    gameStore.clearProjectiles();
    gameStore.clearFloatingDamage();
    gameStore.resetFloorPickups();

    const musicMuted = useSettingsStore.getState().musicMuted;
    playMusic(music.tlvBg, true, musicMuted);

    set({
      ...INITIAL_SESSION_STATE,
      isRunning: true,
      pauseReason: PauseReason.None,
      selectedCharacterId: characterId,
    });
  },

  resetToMainMenu: () => {
    stopMusic();
    const gameStore = useGameStore.getState();
    resetEnemyManager();
    resetMeterManager();
    resetGameplayContext();
    gameStore.resetXpOrbs();
    gameStore.clearProjectiles();
    gameStore.clearFloatingDamage();
    gameStore.resetFloorPickups();
    set({
      ...INITIAL_SESSION_STATE,
      isRunning: false,
      isGameOver: false,
      isPaused: false,
      pauseReason: PauseReason.None,
    });
  },

  addKill: () => set((state) => ({ killCount: state.killCount + 1 })),

  pauseGame: () =>
    set((state) =>
      state.isRunning
        ? { isPaused: true, pauseReason: PauseReason.Manual }
        : state,
    ),

  resumeGame: () =>
    set((state) =>
      state.isRunning
        ? { isPaused: false, pauseReason: PauseReason.None }
        : state,
    ),

  togglePause: () =>
    set((state) => {
      if (!state.isRunning || state.isGameOver) return state;
      const shouldPause = !state.isPaused;
      return {
        isPaused: shouldPause,
        pauseReason: shouldPause ? PauseReason.Manual : PauseReason.None,
      };
    }),

  endGame: (options) => {
    const won = options?.won ?? false;
    stopMusic();
    playSfx(sfx.applause);
    useGameStore.getState().clearFloatingDamage();
    const { runTimer, gold: runGold, killCount } = get();
    if (runGold > 0) {
      useProgressStore.getState().addCoins(runGold);
    }
    const newHighScore = useProgressStore
      .getState()
      .addHighScore({ time: runTimer, killCount, gold: runGold });
    set({
      isRunning: false,
      isGameOver: true,
      gameWon: won,
      newHighScore,
      isPaused: false,
      pauseReason: PauseReason.None,
    });
  },

  updateTimer: (delta) => {
    const { isRunning, isPaused, runTimer } = get();
    if (isRunning && !isPaused) {
      set({ runTimer: runTimer + delta });
    }
  },

  addXp: (amount) => {
    const state = get();
    const progression = resolveLevelProgression({
      level: state.level,
      xp: state.xp,
      nextLevelXp: state.nextLevelXp,
      gainedXp: amount,
    });

    if (progression.levelsGained === 0) {
      set({ xp: progression.xp });
      return;
    }

    const weaponsState = useWeaponsStore.getState();
    const upgradeChoices = buildUpgradeChoices(weaponsState);
    if (upgradeChoices.length === 0) {
      set({
        level: progression.level,
        xp: progression.xp,
        nextLevelXp: progression.nextLevelXp,
        pendingLevelUps: 0,
      });
      return;
    }

    set({
      level: progression.level,
      xp: progression.xp,
      nextLevelXp: progression.nextLevelXp,
      pendingLevelUps: state.pendingLevelUps + progression.levelsGained - 1,
      isPaused: true,
      pauseReason: PauseReason.LevelUp,
      upgradeChoices,
    });
  },

  levelUp: () => {
    const state = get();
    const weaponsState = useWeaponsStore.getState();
    const upgradeChoices = buildUpgradeChoices(weaponsState);
    const nextLevelXp = Math.floor(state.nextLevelXp * 1.2);

    if (upgradeChoices.length === 0) {
      set({
        level: state.level + 1,
        xp: 0,
        nextLevelXp,
        pendingLevelUps: 0,
      });
      return;
    }

    set({
      level: state.level + 1,
      xp: 0,
      nextLevelXp,
      pendingLevelUps: state.pendingLevelUps,
      isPaused: true,
      pauseReason: PauseReason.LevelUp,
      upgradeChoices,
    });
  },

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),

  applyUpgrade: (choice) => {
    const weaponsStore = useWeaponsStore.getState();

    if (choice.kind === ItemKind.Weapon) {
      const { weaponId, isNew, evolvesFrom } = choice;
      if (evolvesFrom) {
        weaponsStore.evolveWeapon(evolvesFrom, weaponId);
      } else if (isNew) {
        weaponsStore.addWeapon(weaponId);
      } else {
        weaponsStore.levelUpWeapon(weaponId);
      }
    }

    if (choice.kind === ItemKind.Passive) {
      const { passiveId, isNew } = choice;
      if (isNew) {
        weaponsStore.addPassive(passiveId);
      } else {
        weaponsStore.levelUpPassive(passiveId);
      }
    }

    const nextState = get();
    if (nextState.pendingLevelUps > 0) {
      const upgradeChoices = buildUpgradeChoices(useWeaponsStore.getState());
      if (upgradeChoices.length === 0) {
        get().resumeFromLevelUp();
        return;
      }

      set({
        pendingLevelUps: nextState.pendingLevelUps - 1,
        isPaused: true,
        pauseReason: PauseReason.LevelUp,
        upgradeChoices,
      });
      return;
    }

    get().resumeFromLevelUp();
  },

  resumeFromLevelUp: () =>
    set({
      isPaused: false,
      pauseReason: PauseReason.None,
      pendingLevelUps: 0,
      upgradeChoices: [],
    }),

  collectPickup: (pickupId, payload) => {
    const pickup = FLOOR_PICKUPS[pickupId];
    if (!pickup) return;

    const goldAmount = payload?.goldAmount ?? pickup.goldAmount ?? 0;
    if (goldAmount > 0) {
      get().addGold(goldAmount);
    }

    if (pickup.healAmount) {
      usePlayerStore.getState().heal(pickup.healAmount);
    }

    if (pickupId === FloorPickupId.Magnet) {
      set({ magnetPulseEndTime: get().runTimer + MAGNET_PULSE_DURATION });
    }
  },
}));
