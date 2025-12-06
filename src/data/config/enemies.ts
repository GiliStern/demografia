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
    },
    sprite_config: {
      textureUrl: "/assets/sprites/cat.png",
      index: 0,
      scale: 2,
      spriteFrameSize: 512,
    },
  },
  [EnemyId.Hipster]: {
    id: EnemyId.Hipster,
    name_he: "היפסטר",
    stats: {
      hp: 10,
      damage: 4,
      speed: 2.5,
      knockback_resistance: 0.1,
    },
    sprite_config: {
      textureUrl: "/assets/sprites/hipster.png",
      index: 1,
      scale: 3,
      spriteFrameSize: 350,
    },
  },
  [EnemyId.Tourist]: {
    id: EnemyId.Tourist,
    name_he: "תייר",
    stats: {
      hp: 15,
      damage: 5,
      speed: 1.5,
      knockback_resistance: 0.2,
    },
    sprite_config: {
      textureUrl: "/assets/sprites/tourist.png",
      index: 2,
      scale: 3,
      spriteFrameSize: 512,
    },
  },
  [EnemyId.ScooterSwarm]: {
    id: EnemyId.ScooterSwarm,
    name_he: "נחיל קורקינטים",
    stats: {
      hp: 3,
      damage: 3,
      speed: 4,
      knockback_resistance: 0,
    },
    sprite_config: {
      textureUrl: "/assets/sprites/scooter swarm.png",
      index: 3,
      scale: 1,
      spriteFrameSize: 512,
    },
  },
  [EnemyId.TiktokStar]: {
    id: EnemyId.TiktokStar,
    name_he: "טיקטוקיסט",
    stats: {
      hp: 25,
      damage: 6,
      speed: 2.2,
      knockback_resistance: 0.3,
    },
    sprite_config: {
      textureUrl: "/assets/sprites/tiktok star.png",
      index: 4,
      scale: 1,
      spriteFrameSize: 512,
    },
  },
};
