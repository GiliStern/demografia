/**
 * Normalized character config - camelCase runtime types.
 * Use this in gameplay code instead of raw CHARACTERS.
 */

import type { CharacterId } from "@/types";
import { CHARACTERS } from "./characters";
import {
  normalizeCharacterData,
  type CharacterDataRuntime,
} from "../normalizeConfig";
import { createNormalizedAccessor } from "../createNormalizedAccessor";

export const getCharacter = createNormalizedAccessor(
  CHARACTERS,
  normalizeCharacterData
) as (id: CharacterId) => CharacterDataRuntime | undefined;
