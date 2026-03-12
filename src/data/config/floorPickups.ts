import {
  floorPickupSprites,
  type FloorPickupSpriteKey,
} from "../../assets/assetPaths";
import { FloorPickupId, type FloorPickupData } from "../../types";

function getPickupTexture(key: FloorPickupSpriteKey): string {
  return floorPickupSprites[key] ?? floorPickupSprites.coins;
}

export const FLOOR_PICKUPS: Record<FloorPickupId, FloorPickupData> = {
  [FloorPickupId.Coins]: {
    id: FloorPickupId.Coins,
    name_he: "מטבעות",
    description_he: "מטבעות בסיסיים.",
    goldAmount: 1,
    sprite_config: {
      textureUrl: getPickupTexture("coins"),
      index: 0,
      scale: 1,
      spriteFrameSize: 100,
    },
  },
  [FloorPickupId.Buchta]: {
    id: FloorPickupId.Buchta,
    name_he: "בוחטה",
    description_he: "גוש מזומנים בינוני.",
    goldAmount: 10,
    sprite_config: {
      textureUrl: getPickupTexture("buchta"),
      index: 0,
      scale: 2,
      spriteFrameSize: 156,
    },
  },
  [FloorPickupId.MassiveWadOfCash]: {
    id: FloorPickupId.MassiveWadOfCash,
    name_he: "ווחאד בוכטה",
    description_he: "גוש מזומנים ענק.",
    goldAmount: 50,
    sprite_config: {
      textureUrl: getPickupTexture("massive_wad_of_cash"),
      index: 0,
      scale: 2,
      spriteFrameSize: 156,
    },
  },
  [FloorPickupId.Hamin]: {
    id: FloorPickupId.Hamin,
    name_he: "חמין",
    description_he: "משיב מעט חיים.",
    healAmount: 30,
    sprite_config: {
      textureUrl: getPickupTexture("hamin"),
      index: 0,
      scale: 1,
      spriteFrameSize: 200,
    },
  },
  [FloorPickupId.Chest]: {
    id: FloorPickupId.Chest,
    name_he: "תיבה",
    description_he: "חיזוק אקראי (Placeholder).",
    sprite_config: {
      textureUrl: getPickupTexture("chest"),
      index: 0,
      scale: 3,
      spriteFrameSize: 64,
    },
  },
  [FloorPickupId.Magnet]: {
    id: FloorPickupId.Magnet,
    name_he: "מגנט",
    description_he: "מושך את כל נקדות למשתמש.",
    sprite_config: {
      textureUrl: getPickupTexture("magnet"),
      index: 0,
      scale: 1,
      spriteFrameSize: 384,
    },
  },
};
