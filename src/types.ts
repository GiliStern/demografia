import type { ComponentType } from "react";
import type { WeaponId } from "./data/config/weapons";

export interface SpriteConfig {
  textureUrl: string;
  index: number;
  scale: number;
  spriteFrameSize?: number;
}

export enum ItemId {
  HealthPotion = "health_potion",
  ManaPotion = "mana_potion",
  SpeedPotion = "speed_potion",
  StrengthPotion = "strength_potion",
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

export enum CharacterId {
  Srulik = "sruLik",
}

export interface CharacterData {
  id: CharacterId;
  name_he: string;
  description_he: string;
  starting_weapon_id: WeaponId;
  passive_id: string;
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
  activeItems: ItemId[];
}

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
