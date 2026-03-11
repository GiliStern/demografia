/**
 * Types barrel - re-exports all types for backward compatibility.
 * Consumers can migrate to direct imports from submodules gradually.
 */

// Domain
export type {
  CharacterData,
  EnemyData,
  FloorPickupData,
  PassiveData,
  PassiveEffect,
  PassiveLevel,
  PassiveStatDelta,
  PlayerStats,
  SpriteConfig,
  WaveData,
  WeaponData,
  WeaponStats,
  WavesConfig,
} from "./domain";
export {
  CharacterId,
  EnemyId,
  FloorPickupId,
  PassiveId,
  WeaponId,
} from "./domain";

// Upgrades
export type {
  PassiveUpgradeOption,
  UpgradeOption,
  WeaponUpgradeOption,
} from "./upgrades";
export { ItemKind } from "./upgrades";

// Weapons
export type {
  ActiveWeaponRenderItem,
  ProjectileWeaponInstance,
  WeaponComponent,
  WeaponComponentRegistry,
  WeaponComponentProps,
  WeaponDefinition,
  WeaponEvolution,
  WeaponLevel,
  WeaponStatDelta,
} from "./weapons";

// Rendering
export type {
  AnimationConfig,
  CentralizedProjectile,
  Position,
  ProjectileData,
  Velocity,
} from "./rendering";
export {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
} from "./rendering";

// Physics
export type {
  EnemyUserData,
  PlayerUserData,
  ProjectileUserData,
  RigidBodyUserData,
  XpOrbUserData,
} from "./physics";

// Store
export type {
  CoreGameState,
  FloatingDamageEntry,
  FloatingDamageStore,
  GameSlice,
  GameState,
  GameStore,
  PlayerStore,
  ProjectilesStore,
  StoreCreator,
  ViewportBounds,
  ViewportStore,
  WeaponsStore,
  XpOrbData,
  XpOrbsStore,
} from "./store";
export { PauseReason } from "./store";
