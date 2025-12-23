import { sprites } from "../../assets/assetPaths";
import { type EnemyData, EnemyId } from "../../types";

export const ENEMIES: Record<EnemyId, EnemyData> = {
  [EnemyId.StreetCats]: {
    id: EnemyId.StreetCats,
    name_he: "חתולי רחוב",
    stats: {
      hp: 5,
      damage: 2,
      speed: 2,
      knockback_resistance: 0,
      xpDrop: 30,
    },
    sprite_config: {
      textureUrl: sprites.cat,
      index: 0,
      scale: 1.5,
      spriteFrameSize: 170,
    },
  },
  [EnemyId.Hipster]: {
    id: EnemyId.Hipster,
    name_he: "היפסטר",
    stats: {
      hp: 20,
      damage: 4,
      speed: 2,
      knockback_resistance: 0.1,
      xpDrop: 50,
    },
    sprite_config: {
      textureUrl: sprites.hipster,
      index: 1,
      scale: 2,
      spriteFrameSize: 116,
    },
  },
  [EnemyId.Tourist]: {
    id: EnemyId.Tourist,
    name_he: "תייר",
    stats: {
      hp: 30,
      damage: 5,
      speed: 2,
      knockback_resistance: 0.2,
      xpDrop: 60,
    },
    sprite_config: {
      textureUrl: sprites.tourist,
      index: 2,
      scale: 2,
      spriteFrameSize: 256,
    },
  },
  [EnemyId.ScooterSwarm]: {
    id: EnemyId.ScooterSwarm,
    name_he: "נחיל קורקינטים",
    stats: {
      hp: 40,
      damage: 3,
      speed: 3,
      knockback_resistance: 0,
      xpDrop: 70,
    },
    sprite_config: {
      textureUrl: sprites.scooterSwarm,
      index: 3,
      scale: 2,
      spriteFrameSize: 256,
    },
  },
  [EnemyId.TiktokStar]: {
    id: EnemyId.TiktokStar,
    name_he: "טיקטוקיסט",
    stats: {
      hp: 60,
      damage: 6,
      speed: 8,
      knockback_resistance: 0.3,
      xpDrop: 80,
    },
    sprite_config: {
      textureUrl: sprites.tiktokStar,
      index: 4,
      scale: 2,
      spriteFrameSize: 170,
    },
  },
};
