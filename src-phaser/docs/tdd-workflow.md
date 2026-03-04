# TDD Workflow

All Phaser migration work follows red-green-refactor.

## Red

- Add failing tests first:
  - Unit tests for state/domain logic (`src-phaser/core/**/*.test.ts`)
  - E2E tests for user flows (`src-phaser/e2e/*.spec.ts`)

## Green

- Implement the minimum production code required to pass the failing tests.
- Keep changes focused to a single behavior increment.

## Refactor

- Improve readability/performance while preserving green test status.
- Re-run:
  - `npm run test:phaser`
  - `npm run test:e2e:phaser`

## Enforcement

- `npm run build:phaser` includes both unit and E2E tests before build output.
- No feature is considered done without tests.
