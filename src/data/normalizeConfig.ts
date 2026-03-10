/**
 * Config normalization - maps snake_case config fields to camelCase runtime types.
 * Call at the boundary when loading or first accessing config.
 */

import type {
  CharacterData,
  WaveData,
  SpriteConfig,
  WeaponId,
  PassiveId,
  PlayerStats,
  EnemyId,
} from "@/types";

export interface CharacterDataRuntime {
  id: CharacterData["id"];
  nameHe: string;
  descriptionHe: string;
  startingWeaponId: WeaponId;
  passiveId: PassiveId;
  stats: PlayerStats;
  spriteConfig: SpriteConfig;
}

export interface WaveEnemyConfigRuntime {
  id: EnemyId;
  spawnInterval: number;
  maxActive: number;
  groupSpawn?: boolean;
}

export interface WaveDataRuntime {
  timeStart: number;
  timeEnd: number;
  enemies: WaveEnemyConfigRuntime[];
}

export function normalizeCharacterData(
  raw: CharacterData
): CharacterDataRuntime {
  return {
    id: raw.id,
    nameHe: raw.name_he,
    descriptionHe: raw.description_he,
    startingWeaponId: raw.starting_weapon_id,
    passiveId: raw.passive_id,
    stats: raw.stats,
    spriteConfig: raw.sprite_config,
  };
}

export function normalizeWaveData(raw: WaveData): WaveDataRuntime {
  return {
    timeStart: raw.time_start,
    timeEnd: raw.time_end,
    enemies: raw.enemies.map((e) => {
      const config: WaveEnemyConfigRuntime = {
        id: e.id,
        spawnInterval: e.spawn_interval,
        maxActive: e.max_active,
      };
      if (e.group_spawn !== undefined) {
        config.groupSpawn = e.group_spawn;
      }
      return config;
    }),
  };
}
