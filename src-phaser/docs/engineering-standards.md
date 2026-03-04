# Engineering Standards

This migration follows professional standards across architecture, testing, and delivery.

## Code Quality

- Strict TypeScript on all Phaser modules.
- Small, composable modules (`core/state`, `core/input`, `scenes`).
- Shared config/type contracts imported from existing codebase to avoid drift.
- Deterministic update loop and explicit collision constants.

## Review Checklist

- Correctness: feature matches parity matrix acceptance criteria.
- Safety: no regressions to existing `src/` app.
- Performance: culling and sprite pooling used in gameplay loop.
- Readability: low-complexity functions and clear naming.
- Testability: behavior exercised by unit + E2E tests.

## CI and Delivery Gates

- `npm run build:phaser` is a hard gate:
  1. `npm run test:phaser`
  2. `npm run test:e2e:phaser`
  3. `tsc`
  4. Phaser production build
- Any failing test blocks build output.

## Bug-Fix Rule

- Every bug fix must include a regression test before implementation changes.
