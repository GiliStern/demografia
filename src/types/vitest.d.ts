declare module "vitest" {
  type TestFn = (name: string, fn: () => void) => void;

  export const describe: TestFn;
  export const it: TestFn;
  export const expect: (
    value: unknown
  ) => {
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toBeGreaterThan: (expected: number) => void;
    toHaveLength: (expected: number) => void;
  };
}

