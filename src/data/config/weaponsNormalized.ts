/**
 * Normalized weapon config - camelCase runtime types.
 * Use getWeapon() in gameplay/rendering code instead of raw WEAPONS.
 */

import type { WeaponId } from "@/types";
import { WEAPONS } from "./weaponsConfig";
import {
  normalizeWeaponDefinition,
  type WeaponDefinitionRuntime,
} from "../normalizeConfig";
import { createNormalizedAccessor } from "../createNormalizedAccessor";

export const getWeapon = createNormalizedAccessor(
  WEAPONS,
  normalizeWeaponDefinition
) as (id: WeaponId) => WeaponDefinitionRuntime | undefined;
