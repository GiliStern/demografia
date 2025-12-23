import { PASSIVES } from "../../data/config/passives";
import type {
  PassiveId,
  PassiveStatDelta,
  PlayerStats,
  WeaponStats,
} from "../../types";

/**
 * Resolves the cumulative stat changes for a passive at a given level.
 * Applies all level bonuses from level 1 up to the specified level.
 */
export const resolvePassiveEffects = (
  passiveId: PassiveId,
  level: number
): PassiveStatDelta => {
  const passive = PASSIVES[passiveId];
  if (!passive) {
    return {};
  }

  const effectiveLevel = Math.max(0, Math.min(level, passive.maxLevel));
  const result: PassiveStatDelta = {
    add: {},
    mult: {},
    weaponAdd: {},
    weaponMult: {},
  };

  // Apply all levels up to the current level
  passive.levels
    .filter((lvl) => lvl.level <= effectiveLevel)
    .forEach((lvl) => {
      const { statChanges } = lvl;

      // Accumulate player stat additions
      if (statChanges.add) {
        for (const key of Object.keys(statChanges.add) as (keyof PlayerStats)[]) {
          const val = statChanges.add[key];
          if (typeof val === "number") {
            result.add![key] = (result.add![key] ?? 0) + val;
          }
        }
      }

      // Accumulate player stat multipliers (compound them)
      if (statChanges.mult) {
        for (const key of Object.keys(statChanges.mult) as (keyof PlayerStats)[]) {
          const val = statChanges.mult[key];
          if (typeof val === "number") {
            result.mult![key] = (result.mult![key] ?? 1) * val;
          }
        }
      }

      // Accumulate weapon stat additions
      if (statChanges.weaponAdd) {
        for (const key of Object.keys(statChanges.weaponAdd) as (keyof WeaponStats)[]) {
          const val = statChanges.weaponAdd[key];
          if (typeof val === "number") {
            result.weaponAdd![key] = (result.weaponAdd![key] ?? 0) + val;
          }
        }
      }

      // Accumulate weapon stat multipliers (compound them)
      if (statChanges.weaponMult) {
        for (const key of Object.keys(statChanges.weaponMult) as (keyof WeaponStats)[]) {
          const val = statChanges.weaponMult[key];
          if (typeof val === "number") {
            result.weaponMult![key] = (result.weaponMult![key] ?? 1) * val;
          }
        }
      }
    });

  return result;
};

interface AccumulatePassiveEffectsParams {
  activeItems: PassiveId[];
  passiveLevels: Partial<Record<PassiveId, number>>;
}

/**
 * Aggregates effects from all active passive items.
 * Returns combined additive and multiplicative bonuses for both player and weapon stats.
 */
export const accumulatePassiveEffects = ({
  activeItems,
  passiveLevels,
}: AccumulatePassiveEffectsParams): PassiveStatDelta => {
  const accumulated: PassiveStatDelta = {
    add: {},
    mult: {},
    weaponAdd: {},
    weaponMult: {},
  };

  for (const passiveId of activeItems) {
    const level = passiveLevels[passiveId] ?? 1;
    const effects = resolvePassiveEffects(passiveId, level);

    // Merge player stat additions
    if (effects.add) {
      for (const key of Object.keys(effects.add) as (keyof PlayerStats)[]) {
        const val = effects.add[key];
        if (typeof val === "number") {
          accumulated.add![key] = (accumulated.add![key] ?? 0) + val;
        }
      }
    }

    // Merge player stat multipliers
    if (effects.mult) {
      for (const key of Object.keys(effects.mult) as (keyof PlayerStats)[]) {
        const val = effects.mult[key];
        if (typeof val === "number") {
          accumulated.mult![key] = (accumulated.mult![key] ?? 1) * val;
        }
      }
    }

    // Merge weapon stat additions
    if (effects.weaponAdd) {
      for (const key of Object.keys(effects.weaponAdd) as (keyof WeaponStats)[]) {
        const val = effects.weaponAdd[key];
        if (typeof val === "number") {
          accumulated.weaponAdd![key] = (accumulated.weaponAdd![key] ?? 0) + val;
        }
      }
    }

    // Merge weapon stat multipliers
    if (effects.weaponMult) {
      for (const key of Object.keys(effects.weaponMult) as (keyof WeaponStats)[]) {
        const val = effects.weaponMult[key];
        if (typeof val === "number") {
          accumulated.weaponMult![key] = (accumulated.weaponMult![key] ?? 1) * val;
        }
      }
    }
  }

  return accumulated;
};

/**
 * Applies accumulated passive effects to base player stats.
 * Order: additions first, then multiplications.
 */
export const applyPassivesToPlayerStats = (
  baseStats: PlayerStats,
  passiveEffects: PassiveStatDelta
): PlayerStats => {
  const result = { ...baseStats };

  // Apply additions first
  if (passiveEffects.add) {
    for (const key of Object.keys(passiveEffects.add) as (keyof PlayerStats)[]) {
      const val = passiveEffects.add[key];
      if (typeof val === "number") {
        result[key] = (result[key] ?? 0) + val;
      }
    }
  }

  // Apply multiplications
  if (passiveEffects.mult) {
    for (const key of Object.keys(passiveEffects.mult) as (keyof PlayerStats)[]) {
      const val = passiveEffects.mult[key];
      if (typeof val === "number") {
        result[key] = (result[key] ?? 0) * val;
      }
    }
  }

  return result;
};

/**
 * Applies accumulated passive effects to base weapon stats.
 * Order: additions first, then multiplications.
 */
export const applyPassivesToWeaponStats = (
  baseStats: WeaponStats,
  passiveEffects: PassiveStatDelta
): WeaponStats => {
  const result = { ...baseStats };

  // Apply weapon additions first
  if (passiveEffects.weaponAdd) {
    for (const key of Object.keys(passiveEffects.weaponAdd) as (keyof WeaponStats)[]) {
      const val = passiveEffects.weaponAdd[key];
      if (typeof val === "number") {
        result[key] = (result[key] ?? 0) + val;
      }
    }
  }

  // Apply weapon multiplications
  if (passiveEffects.weaponMult) {
    for (const key of Object.keys(passiveEffects.weaponMult) as (keyof WeaponStats)[]) {
      const val = passiveEffects.weaponMult[key];
      if (typeof val === "number") {
        result[key] = (result[key] ?? 0) * val;
      }
    }
  }

  return result;
};

