import { sprites } from "../../assets/assetPaths";

export const METER_COLLISION_RADIUS = 1;
export const METER_HP = 1;

export const METER_CONFIG = {
  id: "meter",
  sprite_config: {
    textureUrl: sprites.meter,
    index: 0,
    scale: 2,
    spriteFrameSize: 315,
  },
  hp: METER_HP,
  collisionRadius: METER_COLLISION_RADIUS,
} as const;
