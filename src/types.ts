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
  Privilege = "privilege", // Max health
  Wassach = "wassach", // Cooldown
  Protection = "protection", // Armor
  Gat = "gat", // Damage up
  WingsOfDivinePresence = "wings_divine_presence", // Move speed
  IncreaseJoy = "increase_joy", // Amount
  ShabbatCandles = "shabbat_candles", // Area (Pitas evolution)
  SpittingDistance = "spitting_distance", // Duration (Kaparot evolution)
  OutstretchedArm = "outstretched_arm", // Projectile speed (Star evolution)
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
}

export interface PassiveEffect {
  playerStats?: Partial<PlayerStats>;
  weaponStats?: Partial<WeaponStats>;
}

export interface PassiveData {
  id: PassiveId;
  name_he: string;
  description_he: string;
  effect: PassiveEffect;
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

export interface ProjectileWeaponHookParams {
  weaponId: WeaponId;
}

export interface ProjectileWeaponInstance {
  projectiles: ProjectileData[];
  spriteConfig: SpriteConfig;
  damage: number;
  removeProjectile: (id: string) => void;
  cooldown: number;
  speed: number;
  duration: number;
}

interface EnemyStats {
  hp: number;
  damage: number;
  speed: number;
  knockback_resistance: number;
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

export type RigidBodyUserData =
  | PlayerUserData
  | EnemyUserData
  | ProjectileUserData;

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
}

export interface EnemiesStore {
  killCount: number;
  resetEnemies: () => void;
  addKill: () => void;
}

export interface WeaponsStore {
  activeWeapons: WeaponId[];
  activeItems: PassiveId[];
  weaponLevels: Partial<Record<WeaponId, number>>;
  resetWeapons: (weaponIds: WeaponId[]) => void;
  addWeapon: (weaponId: WeaponId) => void;
  levelUpWeapon: (weaponId: WeaponId) => void;
  addPassive: (passiveId: PassiveId) => void;
  getWeaponStats: (weaponId: WeaponId) => WeaponStats;
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

export type GameStore = GameSlice & PlayerStore & EnemiesStore & WeaponsStore;

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
}

interface PassiveUpgradeOption {
  kind: ItemKind.Passive;
  passiveId: PassiveId;
  isNew: boolean;
}

export type UpgradeOption = WeaponUpgradeOption | PassiveUpgradeOption;

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Velocity {
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
