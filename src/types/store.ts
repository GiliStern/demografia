/**
 * Store interfaces and types.
 */

import type { StateCreator } from "zustand";
import type {
  CharacterId,
  FloorPickupId,
  PassiveId,
  PlayerStats,
  WeaponId,
  WeaponStats,
} from "./domain";
import type { UpgradeOption } from "./upgrades";
import type { CentralizedProjectile } from "./rendering";
import type { PassiveStatDelta } from "./domain";

export enum PauseReason {
  None = "none",
  Manual = "manual",
  LevelUp = "level_up",
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  pauseReason: PauseReason;
  isGameOver: boolean;
  runTimer: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  pendingLevelUps: number;
  gold: number;
  selectedCharacterId: CharacterId;
  activeWeapons: WeaponId[];
  activeItems: PassiveId[];
  upgradeChoices: UpgradeOption[];
}

export interface PlayerStore {
  currentHealth: number;
  playerStats: PlayerStats;
  playerPosition: { x: number; y: number };
  playerDirection: { x: number; y: number };
  setPlayerPosition: (position: { x: number; y: number }) => void;
  setPlayerDirection: (direction: { x: number; y: number }) => void;
  resetPlayer: (characterId: CharacterId) => void;
  takeDamage: (amount: number) => number;
  heal: (amount: number) => void;
  getEffectivePlayerStats: () => PlayerStats;
}

export interface WeaponsStore {
  activeWeapons: WeaponId[];
  activeItems: PassiveId[];
  weaponLevels: Partial<Record<WeaponId, number>>;
  passiveLevels: Partial<Record<PassiveId, number>>;
  resetWeapons: (weaponIds: WeaponId[]) => void;
  addWeapon: (weaponId: WeaponId) => void;
  levelUpWeapon: (weaponId: WeaponId) => void;
  evolveWeapon: (evolvesFrom: WeaponId, weaponId: WeaponId) => void;
  addPassive: (passiveId: PassiveId) => void;
  levelUpPassive: (passiveId: PassiveId) => void;
  getWeaponStats: (weaponId: WeaponId) => WeaponStats;
  getAccumulatedPassiveEffects: () => PassiveStatDelta;
}

export interface ViewportBounds {
  halfWidth: number;
  halfHeight: number;
  width: number;
  height: number;
}

export interface ViewportStore {
  viewportBounds: ViewportBounds | null;
  updateViewportBounds: (bounds: ViewportBounds) => void;
}

export interface XpOrbData {
  id: string;
  position: { x: number; y: number };
  xpValue: number;
}

export interface XpOrbsStore {
  xpOrbsMap: Map<string, XpOrbData>;
  addXpOrb: (orb: XpOrbData) => void;
  removeXpOrb: (id: string) => void;
  resetXpOrbs: () => void;
}

export interface ProjectilesStore {
  addProjectile: (projectile: CentralizedProjectile) => void;
  removeProjectile: (id: string) => void;
  addProjectiles: (projectiles: CentralizedProjectile[]) => void;
  clearProjectiles: () => void;
  getProjectileCount: () => number;
  getProjectilesArray: () => CentralizedProjectile[];
  getProjectile: (id: string) => CentralizedProjectile | undefined;
  getProjectiles: () => ReadonlyMap<string, CentralizedProjectile>;
}

export type CoreGameState = Omit<
  GameState,
  "activeWeapons" | "activeItems"
>;

export interface GameSlice extends CoreGameState {
  startGame: (characterId: CharacterId) => void;
  resetToMainMenu: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  endGame: () => void;
  updateTimer: (delta: number) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  levelUp: () => void;
  applyUpgrade: (choice: UpgradeOption) => void;
  resumeFromLevelUp: () => void;
  collectPickup: (pickupId: FloorPickupId) => void;
}

export type GameStore = ViewportStore & XpOrbsStore & ProjectilesStore;

export type StoreCreator<StoreState> = StateCreator<
  GameStore,
  [],
  [],
  StoreState
>;
