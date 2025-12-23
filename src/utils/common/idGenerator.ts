/**
 * Generates a unique ID using crypto.randomUUID when available, with fallback
 * @returns A unique string ID
 */
export const generateUniqueId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Generates a unique ID with a prefix
 * @param prefix - The prefix to add to the ID
 * @returns A unique string ID with the given prefix
 */
export const generatePrefixedId = (prefix: string): string => {
  return `${prefix}-${generateUniqueId()}`;
};

