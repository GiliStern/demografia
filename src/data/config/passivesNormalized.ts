/**
 * Normalized passive config - camelCase runtime types.
 * Use getPassive() in gameplay/rendering code instead of raw PASSIVES.
 */

import type { PassiveId } from "@/types";
import { PASSIVES } from "./passives";
import {
  normalizePassiveData,
  type PassiveDataRuntime,
} from "../normalizeConfig";

const cache = new Map<PassiveId, PassiveDataRuntime>();

export function getPassive(
  id: PassiveId
): PassiveDataRuntime | undefined {
  let normalized = cache.get(id);
  if (!normalized) {
    const raw = PASSIVES[id];
    if (!raw) return undefined;
    normalized = normalizePassiveData(raw);
    cache.set(id, normalized);
  }
  return normalized;
}
