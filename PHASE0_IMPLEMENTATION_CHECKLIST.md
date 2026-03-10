# Phase 0 Implementation Checklist

Date: 2026-03-10

## Goal

Stabilize the highest-risk correctness issues identified in `CODEBASE_REVIEW.md` before larger architectural refactors begin.

## Priorities

### P0.1 Progression correctness

- [x] Fix XP carryover so overflow XP is preserved after leveling.
- [x] Support repeated level gains from a single XP pickup.
- [x] Queue pending level-up selections so multiple earned levels do not collapse into one reward.
- [x] Add store-level tests for XP overflow and repeated level-ups.

### P0.2 Upgrade and evolution correctness

- [x] Stop modeling evolution as a generic "new weapon" choice.
- [x] Add explicit evolution metadata to weapon upgrade choices.
- [x] Ensure choosing an evolution replaces the base weapon cleanly.
- [x] Add tests covering evolution choice generation and application.

### P0.3 Enemy death ownership

- [x] Make enemy death rewards and kill counting happen in one authoritative place.
- [x] Remove duplicate kill increments from wave removal.
- [x] Deduplicate enemy death handling between projectile callback and Rapier collision callback.

### P0.4 Wave correctness

- [x] Cull enemies using live tracked positions instead of initial spawn positions.
- [x] Keep enemy removal logic separate from reward logic.

### P0.5 Validation

- [x] Run focused tests for the fixed store logic.
- [x] Run lint if the repository dependencies/configuration allow it.
- [x] Record any remaining validation blockers in the task summary.

## This pass

This implementation pass targets P0.1 through P0.4 directly and adds focused tests where the current repository setup allows.

## Validation Notes

- Focused tests passed with `./node_modules/.bin/vitest --run src/store/gameStore.test.ts`.
- Lint passed with `yarn lint`.
- In this environment, `yarn test --run ...` could not resolve `vitest` inside the sandbox even though the direct binary worked outside it. The code changes themselves validated successfully.
