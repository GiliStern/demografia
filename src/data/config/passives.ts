import { passiveSprites, placeholders } from "../../assets/assetPaths";
import { PassiveId, type PassiveData } from "../../types";

/**
 * Passive items configuration matching Vampire Survivors mechanics.
 * Each passive has 5 levels with cumulative bonuses per level.
 *
 * Effect types:
 * - add: Additive bonus (e.g., +20 maxHealth, +1 amount)
 * - mult: Multiplicative bonus (e.g., 1.1 = +10%)
 * - weaponAdd/weaponMult: Applied to weapon stats
 */

export const PASSIVES: Record<PassiveId, PassiveData> = {
  // === גת (Gat) - Spinach equivalent: +10% Might per level ===
  [PassiveId.Gat]: {
    id: PassiveId.Gat,
    name_he: "גת",
    description_he: "מגביר נזק בכל הנשקים.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% נזק",
        statChanges: { mult: { might: 1.1 } },
      },
      {
        level: 2,
        description: "+10% נזק",
        statChanges: { mult: { might: 1.1 } },
      },
      {
        level: 3,
        description: "+10% נזק",
        statChanges: { mult: { might: 1.1 } },
      },
      {
        level: 4,
        description: "+10% נזק",
        statChanges: { mult: { might: 1.1 } },
      },
      {
        level: 5,
        description: "+10% נזק",
        statChanges: { mult: { might: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.gat,
      iconUrl: passiveSprites.gat,
      index: 0,
      scale: 1,
      spriteFrameSize: 284,
    },
  },

  // === פרוטקשן (Protection) - Armor equivalent: +1 Armor per level ===
  [PassiveId.Protection]: {
    id: PassiveId.Protection,
    name_he: "פרוטקשן",
    description_he: "הפחתת נזק מאויבים.",
    maxLevel: 5,
    levels: [
      { level: 1, description: "+1 שריון", statChanges: { add: { armor: 1 } } },
      { level: 2, description: "+1 שריון", statChanges: { add: { armor: 1 } } },
      { level: 3, description: "+1 שריון", statChanges: { add: { armor: 1 } } },
      { level: 4, description: "+1 שריון", statChanges: { add: { armor: 1 } } },
      { level: 5, description: "+1 שריון", statChanges: { add: { armor: 1 } } },
    ],
    sprite_config: {
      textureUrl: passiveSprites.protection,
      iconUrl: passiveSprites.protection,
      index: 0,
      scale: 1,
      spriteFrameSize: 273,
    },
  },

  // === פריווילגיה (Privilege) - Hollow Heart equivalent: +20% Max Health per level ===
  [PassiveId.Privilege]: {
    id: PassiveId.Privilege,
    name_he: "פריווילגיה",
    description_he: "מגדיל את בריאותך המקסימלית.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+20% בריאות",
        statChanges: { mult: { maxHealth: 1.2 } },
      },
      {
        level: 2,
        description: "+20% בריאות",
        statChanges: { mult: { maxHealth: 1.2 } },
      },
      {
        level: 3,
        description: "+20% בריאות",
        statChanges: { mult: { maxHealth: 1.2 } },
      },
      {
        level: 4,
        description: "+20% בריאות",
        statChanges: { mult: { maxHealth: 1.2 } },
      },
      {
        level: 5,
        description: "+20% בריאות",
        statChanges: { mult: { maxHealth: 1.2 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.privilege,
      iconUrl: passiveSprites.privilege,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },

  // === מד"א (MDA) - Pummarola equivalent: +0.2 Recovery per level ===
  [PassiveId.MDA]: {
    id: PassiveId.MDA,
    name_he: 'מד"א',
    description_he: "התאוששות בריאות לאורך זמן.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+0.2 התאוששות",
        statChanges: { add: { recovery: 0.2 } },
      },
      {
        level: 2,
        description: "+0.2 התאוששות",
        statChanges: { add: { recovery: 0.2 } },
      },
      {
        level: 3,
        description: "+0.2 התאוששות",
        statChanges: { add: { recovery: 0.2 } },
      },
      {
        level: 4,
        description: "+0.2 התאוששות",
        statChanges: { add: { recovery: 0.2 } },
      },
      {
        level: 5,
        description: "+0.2 התאוששות",
        statChanges: { add: { recovery: 0.2 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.mda,
      iconUrl: passiveSprites.mda,
      index: 0,
      scale: 1,
      spriteFrameSize: 240,
    },
  },

  // === ווסאח (Wassach) - Empty Tome equivalent: -8% Cooldown per level ===
  [PassiveId.Wassach]: {
    id: PassiveId.Wassach,
    name_he: "ווסאח",
    description_he: "מקצר זמני טעינה.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "-8% קירור",
        statChanges: { mult: { cooldown: 0.92 } },
      },
      {
        level: 2,
        description: "-8% קירור",
        statChanges: { mult: { cooldown: 0.92 } },
      },
      {
        level: 3,
        description: "-8% קירור",
        statChanges: { mult: { cooldown: 0.92 } },
      },
      {
        level: 4,
        description: "-8% קירור",
        statChanges: { mult: { cooldown: 0.92 } },
      },
      {
        level: 5,
        description: "-8% קירור",
        statChanges: { mult: { cooldown: 0.92 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.wassach,
      iconUrl: passiveSprites.wassach,
      index: 0,
      scale: 1,
      spriteFrameSize: 239,
    },
  },

  // === נרות שבת (Shabbat Candles) - Candelabrador equivalent: +10% Area per level ===
  [PassiveId.ShabbatCandles]: {
    id: PassiveId.ShabbatCandles,
    name_he: "נרות שבת",
    description_he: "מגדיל שטח פגיעה.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% שטח",
        statChanges: { mult: { area: 1.1 } },
      },
      {
        level: 2,
        description: "+10% שטח",
        statChanges: { mult: { area: 1.1 } },
      },
      {
        level: 3,
        description: "+10% שטח",
        statChanges: { mult: { area: 1.1 } },
      },
      {
        level: 4,
        description: "+10% שטח",
        statChanges: { mult: { area: 1.1 } },
      },
      {
        level: 5,
        description: "+10% שטח",
        statChanges: { mult: { area: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.candles,
      iconUrl: passiveSprites.candles,
      index: 0,
      scale: 1,
      spriteFrameSize: 208,
    },
  },

  // === זרוע נטויה (Outstretched Arm) - Bracer equivalent: +10% Projectile Speed per level ===
  [PassiveId.OutstretchedArm]: {
    id: PassiveId.OutstretchedArm,
    name_he: "זרוע נטויה",
    description_he: "מאיץ קליעים.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% מהירות קליע",
        statChanges: { weaponMult: { speed: 1.1 } },
      },
      {
        level: 2,
        description: "+10% מהירות קליע",
        statChanges: { weaponMult: { speed: 1.1 } },
      },
      {
        level: 3,
        description: "+10% מהירות קליע",
        statChanges: { weaponMult: { speed: 1.1 } },
      },
      {
        level: 4,
        description: "+10% מהירות קליע",
        statChanges: { weaponMult: { speed: 1.1 } },
      },
      {
        level: 5,
        description: "+10% מהירות קליע",
        statChanges: { weaponMult: { speed: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: placeholders.passive,
      iconUrl: placeholders.passive,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },

  // === הארכה (Extension) - Spellbinder equivalent: +10% Duration per level ===
  [PassiveId.SpittingDistance]: {
    id: PassiveId.SpittingDistance,
    name_he: "הארכה",
    description_he: "מאריך משכי נשקים.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% משך",
        statChanges: { weaponMult: { duration: 1.1 } },
      },
      {
        level: 2,
        description: "+10% משך",
        statChanges: { weaponMult: { duration: 1.1 } },
      },
      {
        level: 3,
        description: "+10% משך",
        statChanges: { weaponMult: { duration: 1.1 } },
      },
      {
        level: 4,
        description: "+10% משך",
        statChanges: { weaponMult: { duration: 1.1 } },
      },
      {
        level: 5,
        description: "+10% משך",
        statChanges: { weaponMult: { duration: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: placeholders.passive,
      iconUrl: placeholders.passive,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },

  // === מרבין בשמחה (Increase Joy) - Duplicator equivalent: +1 Amount per level ===
  [PassiveId.IncreaseJoy]: {
    id: PassiveId.IncreaseJoy,
    name_he: "מרבין בשמחה",
    description_he: "יורה יותר קליעים.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+1 כמות",
        statChanges: { weaponAdd: { amount: 1 } },
      },
      {
        level: 2,
        description: "+1 כמות",
        statChanges: { weaponAdd: { amount: 1 } },
      },
      {
        level: 3,
        description: "+1 כמות",
        statChanges: { weaponAdd: { amount: 1 } },
      },
      {
        level: 4,
        description: "+1 כמות",
        statChanges: { weaponAdd: { amount: 1 } },
      },
      {
        level: 5,
        description: "+1 כמות",
        statChanges: { weaponAdd: { amount: 1 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.increase_joy,
      iconUrl: passiveSprites.increase_joy,
      index: 0,
      scale: 1,
      spriteFrameSize: 512,
    },
  },

  // === כנפי השכינה (Wings of Divine Presence) - Wings equivalent: +10% Move Speed per level ===
  [PassiveId.WingsOfDivinePresence]: {
    id: PassiveId.WingsOfDivinePresence,
    name_he: "כנפי השכינה",
    description_he: "תנועה מהירה יותר.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% מהירות",
        statChanges: { mult: { moveSpeed: 1.1 } },
      },
      {
        level: 2,
        description: "+10% מהירות",
        statChanges: { mult: { moveSpeed: 1.1 } },
      },
      {
        level: 3,
        description: "+10% מהירות",
        statChanges: { mult: { moveSpeed: 1.1 } },
      },
      {
        level: 4,
        description: "+10% מהירות",
        statChanges: { mult: { moveSpeed: 1.1 } },
      },
      {
        level: 5,
        description: "+10% מהירות",
        statChanges: { mult: { moveSpeed: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.wings,
      iconUrl: passiveSprites.wings,
      index: 0,
      scale: 1,
      spriteFrameSize: 512,
    },
  },

  // === כוח משיכה (Magnet) - Attractorb equivalent: +0.5 Magnet (pickup range) per level ===
  [PassiveId.Magnet]: {
    id: PassiveId.Magnet,
    name_he: "כוח משיכה",
    description_he: "מגדיל טווח איסוף.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+0.5 כוח משיכה",
        statChanges: { add: { magnet: 0.5 } },
      },
      {
        level: 2,
        description: "+0.5 כוח משיכה",
        statChanges: { add: { magnet: 0.5 } },
      },
      {
        level: 3,
        description: "+0.5 כוח משיכה",
        statChanges: { add: { magnet: 0.5 } },
      },
      {
        level: 4,
        description: "+0.5 כוח משיכה",
        statChanges: { add: { magnet: 0.5 } },
      },
      {
        level: 5,
        description: "+0.5 כוח משיכה",
        statChanges: { add: { magnet: 0.5 } },
      },
    ],
    sprite_config: {
      textureUrl: passiveSprites.attraction,
      iconUrl: passiveSprites.attraction,
      index: 0,
      scale: 1,
      spriteFrameSize: 512,
    },
  },

  // === תלתן (Clover) - Clover equivalent: +10% Luck per level ===
  [PassiveId.Clover]: {
    id: PassiveId.Clover,
    name_he: "תלתן",
    description_he: "מגדיל מזל.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% מזל",
        statChanges: { mult: { luck: 1.1 } },
      },
      {
        level: 2,
        description: "+10% מזל",
        statChanges: { mult: { luck: 1.1 } },
      },
      {
        level: 3,
        description: "+10% מזל",
        statChanges: { mult: { luck: 1.1 } },
      },
      {
        level: 4,
        description: "+10% מזל",
        statChanges: { mult: { luck: 1.1 } },
      },
      {
        level: 5,
        description: "+10% מזל",
        statChanges: { mult: { luck: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: placeholders.passive,
      iconUrl: placeholders.passive,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },

  // === כתר (Crown) - Crown equivalent: +8% Growth per level ===
  [PassiveId.Crown]: {
    id: PassiveId.Crown,
    name_he: "כתר",
    description_he: "מגדיל נסיון נצבר.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+8% צמיחה",
        statChanges: { mult: { growth: 1.08 } },
      },
      {
        level: 2,
        description: "+8% צמיחה",
        statChanges: { mult: { growth: 1.08 } },
      },
      {
        level: 3,
        description: "+8% צמיחה",
        statChanges: { mult: { growth: 1.08 } },
      },
      {
        level: 4,
        description: "+8% צמיחה",
        statChanges: { mult: { growth: 1.08 } },
      },
      {
        level: 5,
        description: "+8% צמיחה",
        statChanges: { mult: { growth: 1.08 } },
      },
    ],
    sprite_config: {
      textureUrl: placeholders.passive,
      iconUrl: placeholders.passive,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },

  // === מסכת הזהב (Gold Mask) - Stone Mask equivalent: +10% Greed per level ===
  [PassiveId.GoldMask]: {
    id: PassiveId.GoldMask,
    name_he: "מסכת הזהב",
    description_he: "מגדיל זהב נאסף.",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% זהב",
        statChanges: { mult: { greed: 1.1 } },
      },
      {
        level: 2,
        description: "+10% זהב",
        statChanges: { mult: { greed: 1.1 } },
      },
      {
        level: 3,
        description: "+10% זהב",
        statChanges: { mult: { greed: 1.1 } },
      },
      {
        level: 4,
        description: "+10% זהב",
        statChanges: { mult: { greed: 1.1 } },
      },
      {
        level: 5,
        description: "+10% זהב",
        statChanges: { mult: { greed: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: placeholders.passive,
      iconUrl: placeholders.passive,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },

  // === עין הרע (Evil Eye) - Skull O'Maniac equivalent: +10% Curse per level ===
  [PassiveId.EvilEye]: {
    id: PassiveId.EvilEye,
    name_he: "עין הרע",
    description_he: "מגדיל קללה (קושי ותגמולים).",
    maxLevel: 5,
    levels: [
      {
        level: 1,
        description: "+10% קללה",
        statChanges: { mult: { curse: 1.1 } },
      },
      {
        level: 2,
        description: "+10% קללה",
        statChanges: { mult: { curse: 1.1 } },
      },
      {
        level: 3,
        description: "+10% קללה",
        statChanges: { mult: { curse: 1.1 } },
      },
      {
        level: 4,
        description: "+10% קללה",
        statChanges: { mult: { curse: 1.1 } },
      },
      {
        level: 5,
        description: "+10% קללה",
        statChanges: { mult: { curse: 1.1 } },
      },
    ],
    sprite_config: {
      textureUrl: placeholders.passive,
      iconUrl: placeholders.passive,
      index: 0,
      scale: 1,
      spriteFrameSize: 241,
    },
  },
};

/** Maximum number of passive item slots a player can have from level-ups */
export const MAX_PASSIVE_SLOTS = 6;
