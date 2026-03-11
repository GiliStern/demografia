/**
 * Types barrel - re-exports from split modules.
 * @see src/types/ for the split type modules.
 */

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
} from "./types/domain";
export {
  CharacterId,
  EnemyId,
  FloorPickupId,
  PassiveId,
  WeaponId,
} from "./types/domain";

export type { PassiveUpgradeOption, UpgradeOption, WeaponUpgradeOption } from "./types/upgrades";
export { ItemKind } from "./types/upgrades";

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
} from "./types/weapons";

export type {
  AnimationConfig,
  CentralizedProjectile,
  Position,
  ProjectileData,
  Velocity,
} from "./types/rendering";
export {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
} from "./types/rendering";

export type {
  EnemyUserData,
  PlayerUserData,
  ProjectileUserData,
  RigidBodyUserData,
  XpOrbUserData,
} from "./types/physics";

export type {
  CoreGameState,
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
} from "./types/store";
export { PauseReason } from "./types/store";
