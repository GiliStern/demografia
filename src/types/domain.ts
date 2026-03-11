/**
 * Domain types - enums and data interfaces for game entities.
 */

export interface SpriteConfig {
  textureUrl: string;
  iconUrl?: string;
  index: number;
  scale: number;
  spriteFrameSize?: number;
  /** Number of frames in sprite sheet; when 2+ and weapon has shouldSpin, animate */
  spriteFrameCount?: number;
}

export enum PassiveId {
  /** מקסימום בריאות */
  Privilege = "privilege",
  /** קירור */
  Wassach = "wassach",
  /** פרוטקשן */
  Protection = "protection",
  /** גת */
  Gat = "gat",
  /** כנפי השכינה */
  WingsOfDivinePresence = "wings_divine_presence",
  /** מרבין בשמחה */
  IncreaseJoy = "increase_joy",
  /** נרות שבת */
  ShabbatCandles = "shabbat_candles",
  /** הארכה */
  Extension = "extension",
  /** זרוע נטויה */
  OutstretchedArm = "outstretched_arm",
  /** מד"א */
  MDA = "mda",
  /** מגנט */
  Magnet = "magnet",
  /** תלתן */
  Clover = "clover",
  /** מלכות שמיים */
  Crown = "crown",
  /** עין רע */
  EvilEye = "evil_eye",
  /** תאוות בצע */
  Greed = "greed",
}

export enum FloorPickupId {
  /** חמין */
  Hamin = "hamin",
  /** תיבה */
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
  KingOfPitas = "king_of_pitas",
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

export interface WeaponStats {
  damage: number;
  speed: number;
  cooldown: number;
  duration: number;
  area: number;
  amount: number;
  pierce: number;
  knockback: number;
  cooldownPause?: number;
}

export interface WeaponData {
  id: WeaponId;
  name_he: string;
  description_he: string;
  type: string;
  stats: WeaponStats;
  sprite_config: SpriteConfig;
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
