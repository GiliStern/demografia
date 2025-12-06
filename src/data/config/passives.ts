import { placeholders } from "../../assets/assetPaths";
import { PassiveId, type PassiveData } from "../../types";

export const PASSIVES: Record<PassiveId, PassiveData> = {
  [PassiveId.Privilege]: {
    id: PassiveId.Privilege,
    name_he: "פריווילגיה",
    description_he: "מגדיל את בריאותך המקסימלית.",
    effect: { playerStats: { maxHealth: 20 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.Wassach]: {
    id: PassiveId.Wassach,
    name_he: "ווסאח",
    description_he: "מקצר זמני טעינה.",
    effect: { playerStats: { cooldown: 0.9 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.Protection]: {
    id: PassiveId.Protection,
    name_he: "פרוטקשן",
    description_he: "הפחתת נזק (Placeholder).",
    effect: { playerStats: { recovery: 0 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.Gat]: {
    id: PassiveId.Gat,
    name_he: "גת",
    description_he: "מגביר נזק.",
    effect: { playerStats: { might: 1.1 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.WingsOfDivinePresence]: {
    id: PassiveId.WingsOfDivinePresence,
    name_he: "כנפי השכינה",
    description_he: "תנועה מהירה יותר.",
    effect: { playerStats: { moveSpeed: 0.5 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.IncreaseJoy]: {
    id: PassiveId.IncreaseJoy,
    name_he: "מרבין בשמחה",
    description_he: "יורה יותר קליעים.",
    effect: { weaponStats: { amount: 1 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.ShabbatCandles]: {
    id: PassiveId.ShabbatCandles,
    name_he: "נרות שבת",
    description_he: "מגדיל שטח פגיעה.",
    effect: { playerStats: { area: 1.2 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.SpittingDistance]: {
    id: PassiveId.SpittingDistance,
    name_he: "מרחק יריקה",
    description_he: "מאריך משכי נשקים.",
    effect: { weaponStats: { duration: 0.5 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
  [PassiveId.OutstretchedArm]: {
    id: PassiveId.OutstretchedArm,
    name_he: "זרוע נטויה",
    description_he: "מאיץ קליעים.",
    effect: { weaponStats: { speed: 2 } },
    sprite_config: {
      textureUrl: placeholders.sprite,
      index: 0,
      scale: 1,
    },
  },
};
