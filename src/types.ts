import type { ComponentType } from "react";
import type { StateCreator } from "zustand";

export interface SpriteConfig {
  textureUrl: string;
  iconUrl?: string;
  index: number;
  scale: number;
  spriteFrameSize?: number;
}

export enum PassiveId {
  Privilege = "privilege", // Max health (Hollow Heart)
  Wassach = "wassach", // Cooldown (Empty Tome)
  Protection = "protection", // Armor
  Gat = "gat", // Damage up (Spinach)
  WingsOfDivinePresence = "wings_divine_presence", // Move speed (Wings)
  IncreaseJoy = "increase_joy", // Amount (Duplicator)
  ShabbatCandles = "shabbat_candles", // Area (Candelabrador) - Pitas evolution
  SpittingDistance = "spitting_distance", // Duration (Spellbinder) - Kaparot evolution
  OutstretchedArm = "outstretched_arm", // Projectile speed (Bracer) - Star evolution
  MDA = "mda", // Recovery (Pummarola)
  Magnet = "magnet", // Pickup range (Attractorb)
  Clover = "clover", // Luck
  Crown = "crown", // Growth
  GoldMask = "gold_mask", // Greed (Stone Mask)
  EvilEye = "evil_eye", // Curse (Skull O'Maniac)
}

export enum FloorPickupId {
  Hamin = "hamin",
  Chest = "chest",
}

export interface PlayerStats {
  maxHealth: number;
  moveSpeed: number;
  might: number;
  area: number;
  cooldown: number;
  recovery: number;
  luck: number;
  growth: number;
  greed: number;
  curse: number;
  revivals: number;
  armor: number;
  magnet: number;
}

export interface PassiveStatDelta {
  add?: Partial<PlayerStats>;
  mult?: Partial<PlayerStats>;
  weaponAdd?: Partial<WeaponStats>;
  weaponMult?: Partial<WeaponStats>;
}

export interface PassiveLevel {
  level: number;
  description: string;
  statChanges: PassiveStatDelta;
}

export interface PassiveEffect {
  playerStats?: Partial<PlayerStats>;
  weaponStats?: Partial<WeaponStats>;
}

export interface PassiveData {
  id: PassiveId;
  name_he: string;
  description_he: string;
  maxLevel: number;
  levels: PassiveLevel[];
  sprite_config: SpriteConfig;
}

export interface FloorPickupData {
  id: FloorPickupId;
  name_he: string;
  description_he: string;
  healAmount?: number;
}

export enum CharacterId {
  Srulik = "sruLik",
}

export enum WeaponId {
  Sabra = "sabra",
  KeterChairs = "keter_chairs",
  Kaparot = "kaparot",
  Pitas = "pitas",
  StarOfDavid = "star_of_david",
  HolyCactus = "holy_cactus",
  NoFuture = "no_future",
  UnholySelichot = "unholy_selichot",
  BurekasOfDeath = "burekas_of_death",
  ThousandEdge = "thousand_edge",
}

export interface CharacterData {
  id: CharacterId;
  name_he: string;
  description_he: string;
  starting_weapon_id: WeaponId;
  passive_id: PassiveId;
  stats: PlayerStats;
  sprite_config: SpriteConfig;
}

export interface WeaponStats {
  damage: number;
  speed: number;
  cooldown: number;
  duration: number;
  area: number;
  amount: number;
  pierce: number;
  cooldownPause?: number; // for orbit/other weapons to represent downtime between cycles
}

export interface WeaponData {
  id: WeaponId;
  name_he: string;
  description_he: string;
  type: string;
  stats: WeaponStats;
  sprite_config: SpriteConfig;
}

export interface WeaponStatDelta {
  add?: Partial<WeaponStats>;
  mult?: Partial<WeaponStats>;
}

export interface WeaponLevel {
  level: number;
  description: string;
  statChanges?: WeaponStatDelta;
}

export interface WeaponEvolution {
  passiveRequired: PassiveId;
  evolvesTo: WeaponId;
}

export interface WeaponDefinition extends WeaponData {
  maxLevel?: number;
  levels?: WeaponLevel[];
  evolution?: WeaponEvolution;
  shouldSpin: boolean;
}

export interface WeaponComponentProps {
  weaponId: WeaponId;
}

export type WeaponComponent = ComponentType<WeaponComponentProps>;

export interface ActiveWeaponRenderItem {
  weaponId: WeaponId;
  key: string;
  Component: WeaponComponent;
}

export type WeaponComponentRegistry = Partial<
  Record<WeaponId, WeaponComponent>
>;

export interface ProjectileWeaponInstance {
  projectiles: ProjectileData[];
  spriteConfig: SpriteConfig;
  damage: number;
  removeProjectile: (id: string) => void;
  cooldown: number;
  speed: number;
  duration: number;
  amount: number;
  shouldSpin: boolean;
}

interface EnemyStats {
  hp: number;
  damage: number;
  speed: number;
  knockback_resistance: number;
  xpDrop: number;
}

export enum EnemyId {
  StreetCats = "street_cats",
  Hipster = "hipster",
  Tourist = "tourist",
  ScooterSwarm = "scooter_swarm",
  TiktokStar = "tiktok_star",
}

export interface EnemyData {
  id: EnemyId;
  name_he: string;
  stats: EnemyStats;
  sprite_config: SpriteConfig;
}

export interface WaveData {
  time_start: number;
  time_end: number;
  enemies: {
    id: EnemyId;
    spawn_interval: number;
    max_active: number;
    group_spawn?: boolean;
  }[];
}

export type WavesConfig = Record<string, WaveData[]>;

export interface PlayerUserData {
  type: "player";
  characterId: CharacterId;
}

export interface EnemyUserData {
  type: "enemy";
  id: string;
  enemyId: EnemyId;
  damage: number;
}

export interface ProjectileUserData {
  type: "projectile";
  id: string;
  damage: number;
  owner: "player" | "enemy";
}

export interface XpOrbUserData {
  type: "xpOrb";
  id: string;
  xpValue: number;
}

export type RigidBodyUserData =
  | PlayerUserData
  | EnemyUserData
  | ProjectileUserData
  | XpOrbUserData;

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
  gold: number;
  killCount: number;
  selectedCharacterId: CharacterId;
  activeWeapons: WeaponId[]; // IDs of active weapons
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

export interface EnemiesStore {
  killCount: number;
  resetEnemies: () => void;
  addKill: () => void;
  enemiesPositions: Record<string, { x: number; y: number }>;
  enemyDamageCallbacks: Map<string, (damage: number) => void>;
  registerEnemy: (id: string, position: { x: number; y: number }) => void;
  updateEnemyPosition: (id: string, position: { x: number; y: number }) => void;
  removeEnemy: (id: string) => void;
  registerEnemyDamageCallback: (
    id: string,
    callback: (damage: number) => void
  ) => void;
  damageEnemy: (id: string, damage: number) => void;
}

export interface WeaponsStore {
  activeWeapons: WeaponId[];
  activeItems: PassiveId[];
  weaponLevels: Partial<Record<WeaponId, number>>;
  passiveLevels: Partial<Record<PassiveId, number>>;
  resetWeapons: (weaponIds: WeaponId[]) => void;
  addWeapon: (weaponId: WeaponId) => void;
  levelUpWeapon: (weaponId: WeaponId) => void;
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
  xpOrbs: XpOrbData[];
  addXpOrb: (orb: XpOrbData) => void;
  removeXpOrb: (id: string) => void;
  resetXpOrbs: () => void;
}

export interface CentralizedProjectile {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z?: number };
  damage: number;
  textureUrl: string;
  spriteIndex: number;
  spriteFrameSize: number;
  scale: number;
  spawnTime: number;
  duration: number;
  flipX?: boolean;
  shouldSpin?: boolean;
  // Weapon-specific behavior
  weaponId: WeaponId;
  behaviorType?: "normal" | "bounce" | "homing";
}

// Re-export ProjectilesStore interface from projectilesStore
export interface ProjectilesStore {
  projectiles: Map<string, CentralizedProjectile>;
  addProjectile: (projectile: CentralizedProjectile) => void;
  removeProjectile: (id: string) => void;
  addProjectiles: (projectiles: CentralizedProjectile[]) => void;
  clearProjectiles: () => void;
  getProjectilesArray: () => CentralizedProjectile[];
  updateProjectile: (
    id: string,
    updates: Partial<CentralizedProjectile>
  ) => void;
  updateProjectiles: (
    updates: { id: string; updates: Partial<CentralizedProjectile> }[]
  ) => void;
}

export type CoreGameState = Omit<
  GameState,
  "activeWeapons" | "activeItems" | "killCount"
>;

export interface GameSlice extends CoreGameState {
  startGame: (characterId: CharacterId) => void;
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

export type GameStore = GameSlice &
  PlayerStore &
  EnemiesStore &
  WeaponsStore &
  ViewportStore &
  XpOrbsStore &
  ProjectilesStore;

export type StoreCreator<StoreState> = StateCreator<
  GameStore,
  [],
  [],
  StoreState
>;

export enum ItemKind {
  Weapon = "weapon",
  Passive = "passive",
}

interface WeaponUpgradeOption {
  kind: ItemKind.Weapon;
  weaponId: WeaponId;
  isNew: boolean;
  currentLevel: number;
}

interface PassiveUpgradeOption {
  kind: ItemKind.Passive;
  passiveId: PassiveId;
  isNew: boolean;
  currentLevel: number;
}

export type UpgradeOption = WeaponUpgradeOption | PassiveUpgradeOption;

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface ProjectileData {
  id: string;
  position: Position;
  velocity: Velocity;
  duration: number;
  damage: number;
}

export interface ProjectileProps extends ProjectileData {
  spriteConfig: SpriteConfig;
  shouldSpin: boolean;
  onDespawn: () => void;
}

export enum AnimationType {
  Idle = "idle",
  Run = "run",
  IdleUp = "idle_up",
  RunUp = "run_up",
}

export enum AnimationCategory {
  Characters = "characters",
  Enemies = "enemies",
  Weapons = "weapons",
}

export interface AnimationConfig {
  frames: number[];
  frameRate: number;
  loop: boolean;
}

export enum AnimationVariant {
  Default = "default",
}
