import {
  type CharacterData,
  CharacterId,
  type PlayerStats,
  WeaponId,
  PassiveId,
} from "../../types";
import { icons, sprites } from "../../assets/assetPaths";

export const INITIAL_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  moveSpeed: 4,
  might: 1,
  area: 1,
  cooldown: 1,
  recovery: 0,
  luck: 1,
  growth: 1,
  greed: 1,
  curse: 1,
  revivals: 0,
  armor: 0,
  magnet: 1,
};

export const CHARACTERS: Record<CharacterId, CharacterData> = {
  [CharacterId.Srulik]: {
    id: CharacterId.Srulik,
    name_he: "שרוליק",
    description_he: "הדמות האיקונית, גרסת פיקסל קומית.",
    starting_weapon_id: WeaponId.Sabra,
    passive_id: PassiveId.Privilege,
    stats: INITIAL_PLAYER_STATS,
    sprite_config: {
      textureUrl: sprites.srulik512,
      iconUrl: icons.srulik,
      index: 0,
      scale: 2,
      spriteFrameSize: 256,
    },
  },
  [CharacterId.KingOfPitas]: {
    id: CharacterId.KingOfPitas,
    name_he: "מלך הפיתות",
    description_he: "שר המשטרה",
    starting_weapon_id: WeaponId.Pitas,
    passive_id: PassiveId.Privilege,
    stats: INITIAL_PLAYER_STATS,
    sprite_config: {
      textureUrl: sprites.kingOfPitas,
      iconUrl: icons.kingOfPitas,
      index: 0,
      scale: 2,
      spriteFrameSize: 200,
    },
  },
};
