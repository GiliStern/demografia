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

export interface CharacterData {
  id: string;
  name_he: string;
  description_he: string;
  starting_weapon_id: string;
  passive_id: string;
  stats: PlayerStats;
  sprite_config: {
    texture: string;
    textureUrl?: string;
    index: number;
    scale: number;
    spriteFrameSize?: number;
  };
}

export interface WeaponData {
  id: string;
  name_he: string;
  description_he: string;
  type: string;
  stats: {
    damage: number;
    speed: number;
    cooldown: number;
    duration: number;
    area: number;
    amount: number;
    pierce: number;
  };
  sprite_config: {
    texture: string;
    textureUrl?: string;
    index: number;
    scale?: number;
    spriteFrameSize?: number;
  };
}

export interface EnemyData {
  id: string;
  name_he: string;
  stats: {
    hp: number;
    damage: number;
    speed: number;
    knockback_resistance: number;
  };
  sprite_config: {
    texture: string;
    textureUrl?: string;
    index: number;
    scale: number;
    spriteFrameSize?: number;
  };
}

export interface WaveData {
  time_start: number;
  time_end: number;
  enemies: {
    id: string;
    spawn_interval: number;
    max_active: number;
    group_spawn?: boolean;
  }[];
}

export type WavesConfig = Record<string, WaveData[]>;

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  runTimer: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  killCount: number;
  selectedCharacterId: string | null;
  activeWeapons: string[]; // IDs of active weapons
  activeItems: string[];
}
