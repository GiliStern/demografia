import { type CharacterData, CharacterId, type PlayerStats } from "../../types";
import { WeaponId } from "./weapons";

export const INITIAL_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  moveSpeed: 3,
  might: 1,
  area: 1,
  cooldown: 1,
  recovery: 0,
  luck: 1,
  growth: 1,
  greed: 1,
  curse: 1,
  revivals: 0,
};

export const CHARACTERS: Record<CharacterId, CharacterData> = {
  [CharacterId.Srulik]: {
    id: CharacterId.Srulik,
    name_he: "שרוליק",
    description_he: "הדמות האיקונית, גרסת פיקסל קומית.",
    starting_weapon_id: WeaponId.Prickly,
    passive_id: "TBD_passive",
    stats: INITIAL_PLAYER_STATS,
    sprite_config: {
      textureUrl: "/assets/sprites/srulik_512x512.png",
      index: 0,
      scale: 3,
      spriteFrameSize: 512,
    },
  },
};
