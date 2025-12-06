import {
  type CharacterData,
  CharacterId,
  type PlayerStats,
  WeaponId,
  PassiveId,
} from "../../types";

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
    starting_weapon_id: WeaponId.Sabra,
    passive_id: PassiveId.Privilege,
    stats: INITIAL_PLAYER_STATS,
    sprite_config: {
      textureUrl: "/assets/sprites/srulik_512x512.png",
      iconUrl: "/assets/icons/srulik_icon.png",
      index: 0,
      scale: 3,
      spriteFrameSize: 512,
    },
  },
};
