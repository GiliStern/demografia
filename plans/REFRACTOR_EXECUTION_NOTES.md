# Refactoring Execution Notes (2026-03-11)

Tracking decisions, edge cases, and TODOs discovered during the Demografia refactor.

## Phase 1 — EnemyManager (Completed)

### Decisions
- **EnemyManager owns full state**: position, HP, typeId, sprite config. Replaces the previous registry-style enemyManager.
- **Movement**: Pure math (chase player), no Rapier. Matches ProjectileManager pattern.
- **Rendering**: BatchedEnemyRenderer with instanced sprites, like BatchedProjectileRenderer.
- **Player contact damage**: Handled in EnemyManager.tick via context's reportContactDamage, throttled to 500ms (matches previous behavior).

### Edge Cases
- Animation: Batched renderer uses static spriteIndex from config (no per-enemy animation for now).
- Culling: EnemyManager.tick removes enemies beyond cull distance (using viewport bounds from context).

### Completed
- Removed per-enemy React components (Enemy.tsx, useEnemyBehavior.ts)
- WaveManager now only runs spawn logic; BatchedEnemyRenderer handles tick + render
- Entity batcher key format: `textureUrl::spriteFrameSize` (consistent with BatchedProjectileRenderer)

## Phase 2 — GameplayContext (Completed)

- Created `src/simulation/gameplayContext.ts` with interface and default implementation
- Migrated useWeaponFiringLoop, gameStoreAccess, BatchedEnemyRenderer to use GameplayContext
- Added setGameplayContext for test injection

## Phase 3–5 (Completed)

- weaponsStore: per-weapon stats caching with invalidation on level/passive changes
- docs/STATE_ARCHITECTURE.md created
- Integration tests in src/simulation/__tests__/coreLoop.test.ts
