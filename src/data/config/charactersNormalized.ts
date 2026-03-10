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

const cache = new Map<CharacterId, CharacterDataRuntime>();

export function getCharacter(
  id: CharacterId
): CharacterDataRuntime | undefined {
  let normalized = cache.get(id);
  if (!normalized) {
    const raw = CHARACTERS[id];
    if (!raw) return undefined;
    normalized = normalizeCharacterData(raw);
    cache.set(id, normalized);
  }
  return normalized;
}
