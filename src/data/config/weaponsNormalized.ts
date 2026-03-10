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

const cache = new Map<WeaponId, WeaponDefinitionRuntime>();

export function getWeapon(
  id: WeaponId
): WeaponDefinitionRuntime | undefined {
  let normalized = cache.get(id);
  if (!normalized) {
    const raw = WEAPONS[id];
    if (!raw) return undefined;
    normalized = normalizeWeaponDefinition(raw);
    cache.set(id, normalized);
  }
  return normalized;
}
