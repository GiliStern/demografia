/**
 * Generic config normalizer - creates cached accessors for raw config.
 * Replaces the repetitive pattern in *Normalized.ts files.
 */

/**
 * Creates a cached accessor for a Record config.
 * Normalizes on first access and caches the result.
 */
export function createNormalizedAccessor<
  RawId extends string,
  Raw,
  Runtime,
>(
  rawConfig: Record<RawId, Raw>,
  normalize: (raw: Raw) => Runtime
): (id: RawId) => Runtime | undefined {
  const cache = new Map<RawId, Runtime>();

  return (id: RawId): Runtime | undefined => {
    let normalized = cache.get(id);
    if (!normalized) {
      const raw = rawConfig[id];
      if (!raw) return undefined;
      normalized = normalize(raw);
      cache.set(id, normalized);
    }
    return normalized;
  };
}

/**
 * Creates a cached accessor for array-based config (e.g. waves per stage).
 * Normalizes on first access and caches the result.
 */
export function createNormalizedArrayAccessor<
  Key extends string,
  Raw,
  Runtime,
>(
  getRaw: (key: Key) => Raw[],
  normalize: (raw: Raw) => Runtime
): (key: Key) => Runtime[] {
  const cache = new Map<Key, Runtime[]>();

  return (key: Key): Runtime[] => {
    let normalized = cache.get(key);
    if (!normalized) {
      const rawArray = getRaw(key) ?? [];
      normalized = rawArray.map(normalize);
      cache.set(key, normalized);
    }
    return normalized;
  };
}
