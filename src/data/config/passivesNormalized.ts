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
import { createNormalizedAccessor } from "../createNormalizedAccessor";

export const getPassive = createNormalizedAccessor(
  PASSIVES,
  normalizePassiveData
) as (id: PassiveId) => PassiveDataRuntime | undefined;
