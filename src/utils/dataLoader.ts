/**
 * Lightweight data loader abstraction so gameplay systems can depend on one place.
 * For now it simply wraps dynamic import of JSON so it stays tree-shakeable in Vite.
 */
export async function loadJson<T>(path: string): Promise<T> {
  const module = await import(/* @vite-ignore */ path, {
    assert: { type: 'json' },
  } as any);
  return (module.default ?? module) as T;
}

/**
 * Helper to load a batch of JSON files in parallel.
 */
export async function loadJsonBatch<T extends Record<string, string>>(
  files: T,
): Promise<{ [K in keyof T]: unknown }> {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, value]) => {
      const data = await loadJson<unknown>(value);
      return [key, data] as const;
    }),
  );
  return Object.fromEntries(entries) as { [K in keyof T]: unknown };
}

