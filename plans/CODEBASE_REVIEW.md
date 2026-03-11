# Demografia Codebase Review

Date: 2026-03-10

## Scope

This review is based on a static inspection of the repository, focused on gameplay correctness, architecture, technology choices, readability, maintainability, and refactoring opportunities.

I also attempted to validate the current developer workflow:

- `yarn test --run` works in a normal shell environment, but the suite currently has one failing test: `src/utils/weapons/weapons.test.ts` (`resolveWeaponStats > applies Sabra level bonuses`).
- `yarn lint` passes.

Because of that, this report should be read as a source-level expert review, not as a runtime certification.

## Executive Summary

The codebase has a solid foundation for a browser-only survivor game: the stack is appropriate, content is largely data-driven, and there is clear intent to optimize hot paths such as projectile rendering. The project is already beyond prototype stage in terms of scope and structure.

The main problems are not cosmetic. There are several gameplay correctness issues in core progression and combat flows, and they come from architectural ambiguity more than from isolated typos. The most important example is that authoritative game events such as level-up resolution and enemy death are split across multiple modules with overlapping responsibilities. This creates real bugs today and raises the cost of future changes.

The second major issue is inconsistency of execution models. Some systems are moving toward centralized, batched, data-oriented processing, while others still use local React state, per-entity physics, or ad hoc polling. That mixed model makes performance harder to reason about and makes the codebase feel less coherent than it should for a game of this size.

## Verification Pass

Current verification against the repository state on 2026-03-10:

- `yarn lint` now passes.
- `yarn build` now passes.
- `yarn test --run` works in a normal shell environment and currently reports one failing test in `src/utils/weapons/weapons.test.ts`.

Finding status summary:

| # | Status | Notes |
|---|---|---|
| 1 | Fixed | XP overflow and repeated level-ups are handled by `resolveLevelProgression()` and covered by store tests. |
| 2 | Fixed | Evolution choices now carry `evolvesFrom`, and applying them replaces the base weapon cleanly. |
| 3 | Fixed | Kill counting/reward side effects are owned by `useEnemyBehavior`, while wave removal only removes roster entries. |
| 4 | Fixed | Wave culling now reads live enemy positions from the registry rather than stale spawn coordinates. |
| 5 | Fixed | Per-frame Zustand writes removed. `projectileCount` replaced with `getProjectileCount()`; store only handles coarse lifecycle (add/remove/clear). |
| 6 | Fixed | All hot-path `getState()` usage now goes through `gameStoreAccess.ts` (getProjectileTickContext, getEnemyPositionsRegistrySnapshot). BatchedProjectileRenderer and useWaveManager use these adapters. |
| 7 | Fixed | Enemy positions now live in a mutable `Map` registry without cloning the full collection on each update. |
| 8 | Fixed | Touch input now flows through a single shared hook and no longer relies on duplicated polling loops. |
| 9 | Partially Fixed | Config normalization extended to weapons, passives, enemies (`weaponsNormalized`, `passivesNormalized`, `enemiesNormalized`). `src/types.ts` still broad; config files remain large. |
| 10 | Fixed | Runtime consumers now use getWeapon/getPassive/getEnemy/getCharacter with camelCase (`spriteConfig`). Raw config snake_case kept at config boundary only. |
| 11 | Partially Fixed | CI, README, @eslint/js aligned. README lists test command. PERFORMANCE_OPTIMIZATION_SUMMARY updated. Remaining: `vite.config.ts` @ts-nocheck (wyw-in-js type issue), one test failure in `weapons.test.ts`. |

## Findings

### 1. Critical: XP carryover and multi-level progression are incorrect

Status: Fixed.

Verification note: `addXp()` now routes through `resolveLevelProgression()`, preserves overflow XP, supports repeated level gains, and tracks extra level-up rewards with `pendingLevelUps`.

Affected files:

- `src/store/gameStore.ts`

Why it matters:

- `addXp()` computes `newXp`, but if the threshold is crossed it calls `levelUp()` without passing the accumulated XP forward.
- `levelUp()` then subtracts `nextLevelXp` from the old stored `xp`, not from the new post-pickup total.
- Large XP gains cannot chain multiple level-ups correctly.

Impact:

- Players can lose XP on level-up.
- XP can go negative after crossing a threshold.
- Balance tuning becomes unreliable because progression math is wrong at the state boundary.

Recommendation:

- Replace `addXp()` plus `levelUp()` with a single pure progression reducer that accepts an XP delta and resolves:
  - total XP after the pickup
  - repeated level-ups while thresholds are met
  - leftover XP carryover
  - upgrade choice generation for the final resulting level state

### 2. High: Weapon evolution flow is internally inconsistent

Status: Fixed.

Verification note: upgrade choices now include `evolvesFrom`, and `applyUpgrade()` explicitly replaces the base weapon when an evolution is selected.

Affected files:

- `src/store/gameStore.ts`

Why it matters:

- `buildUpgradeChoices()` offers evolution as a new weapon (`isNew: true`).
- `applyUpgrade()` only performs the base-to-evolved replacement logic in the non-new branch.
- That means choosing an evolution can add the evolved weapon without cleanly replacing the base weapon.

Impact:

- Evolution behavior can be incorrect or duplicate weapons.
- Upgrade choice generation can later offer meaningless or stale evolution options.
- The upgrade system is hard to trust because selection semantics are encoded indirectly through `isNew`.

Recommendation:

- Introduce an explicit upgrade action model:
  - `add_weapon`
  - `level_weapon`
  - `evolve_weapon`
  - `add_passive`
  - `level_passive`
- Generate choices in terms of those actions instead of overloading `isNew`.

### 3. High: Enemy death side effects have no single owner

Status: Fixed.

Verification note: `useEnemyBehavior.handleDeath()` now owns reward spawning and kill increments, while `useWaveManager.removeEnemy()` only removes enemies from the active wave list.

Affected files:

- `src/hooks/entities/useEnemyBehavior.ts`
- `src/hooks/game/useWaveManager.ts`

Why it matters:

- `useEnemyBehavior` grants XP/gold and increments kills when HP reaches zero.
- `useWaveManager.removeEnemy()` also increments kills when the enemy is removed.
- Reward handling is split between death logic and wave removal logic, and `useWaveManager` still contains a `TODO` that contradicts the current behavior.

Impact:

- Kill count is incremented twice.
- Death, reward, removal, and wave bookkeeping are coupled but not centralized.
- Future changes like elite enemies, chest drops, or death effects will likely introduce regressions.

Recommendation:

- Create one authoritative enemy-death pipeline, ideally a store/domain action such as `resolveEnemyDeath(enemyId, context)`.
- That action should own:
  - reward creation
  - kill count
  - enemy deregistration
  - wave bookkeeping
  - optional special death behavior

### 4. High: Wave culling uses stale spawn coordinates instead of live enemy positions

Status: Fixed.

Verification note: `useWaveManager()` now reads `enemyPositionsRegistry`, and `filterEnemiesWithinCullDistance()` resolves live tracked positions before culling.

Affected files:

- `src/hooks/game/useWaveManager.ts`

Why it matters:

- Enemies are culled using `enemy.position`, which is the initial spawn position stored in the local wave list.
- Real movement is tracked separately in `enemiesPositions`.

Impact:

- An enemy can travel near the player and still be culled as if it were still at its original spawn point.
- This creates correctness issues and makes spawn/cull behavior difficult to tune.

Recommendation:

- Make the wave manager read from one active-enemy source of truth.
- Either keep live positions in the wave manager itself or keep the active roster in a shared simulation layer and derive wave bookkeeping from that.

### 5. High: Projectile architecture is only partially centralized, and the new path still writes frame-rate state through Zustand

Status: Fixed.

Verification note: `BatchedProjectileRenderer` no longer calls `syncProjectileCount()`. `projectileCount` was removed from store state; `getProjectileCount()` now reads from the manager. Simulation runs in `projectileManager` (ref-backed); store updates only on coarse lifecycle (add/remove/clear).

Affected files:

- `src/components/BatchedProjectileRenderer.tsx`
- `src/store/projectilesStore.ts`
- `src/components/weapons/ArcWeapon.tsx`
- `src/components/Projectile.tsx`
- `src/hooks/entities/useProjectileBehavior.ts`

Why it matters:

- The project is moving toward a good centralized projectile model, but the migration is incomplete.
- `ArcWeapon` still uses local React state and Rapier bodies per projectile.
- `BatchedProjectileRenderer` updates projectile positions by cloning and writing a `Map` through Zustand every frame, then forcing React rerenders to reflect movement.

Impact:

- Performance characteristics differ by weapon.
- The system is harder to extend because each weapon family follows different runtime rules.
- The intended batching win is reduced by frame-rate store churn.

Recommendation:

- Finish the migration and choose one projectile execution model.
- For fast-moving projectile simulation, prefer a ref-backed simulation buffer or dedicated projectile manager, with store updates only for coarse UI-relevant events.
- Delete legacy projectile paths once the centralized model is complete.

### 6. High: Zustand is used as both domain boundary and frame-loop transport layer

Status: Fixed.

Verification note: All imperative `getState()` usage in frame hot paths now goes through named adapters in `gameStoreAccess.ts`: `getProjectileTickContext()`, `getEnemyPositionsRegistrySnapshot()`, etc. BatchedProjectileRenderer and useWaveManager use these adapters instead of inline getState.

Affected files:

- `src/store/gameStore.ts`
- `src/App.tsx`
- `src/components/GameCanvas.tsx`
- `src/components/InGameHUD.tsx`
- `src/components/LevelUpOverlay.tsx`
- `src/hooks/game/useWaveManager.ts`
- `src/hooks/weapons/*`
- `src/hooks/entities/*`

Why it matters:

- Many modules subscribe to the whole store with `useGameStore()`.
- Other hot-path code bypasses React subscriptions entirely with `useGameStore.getState()`.
- Frame-updated data such as enemy positions, projectile positions, viewport bounds, and timers are mixed with slower UI state in the same state container.

Impact:

- Hidden coupling between systems.
- Harder testability because state dependencies are implicit.
- Larger rerender surface than necessary.
- Store semantics are inconsistent: sometimes reactive, sometimes imperative, sometimes acting like a service locator.

Recommendation:

- Split responsibilities:
  - UI/session state in Zustand
  - simulation state in dedicated frame-owned structures
  - pure gameplay reducers/helpers for deterministic rules
- Enforce selector-based consumption in UI components.
- Isolate imperative `getState()` access behind named frame-system adapters.

### 7. Medium: Enemy position tracking clones a global object on every enemy update

Status: Fixed.

Verification note: `src/store/enemiesStore.ts` now keeps enemy positions in a mutable `Map` registry and updates entries in place instead of cloning a global object.

Affected files:

- `src/store/enemiesStore.ts`
- `src/hooks/entities/useEnemyBehavior.ts`

Why it matters:

- Every enemy writes its position into the global store on each frame.
- `updateEnemyPosition()` clones the entire `enemiesPositions` object for every update.

Impact:

- Cost grows with enemy count.
- The store becomes a hot path for simulation rather than a state boundary for consumers.

Recommendation:

- Keep enemy positions in a mutable simulation registry and publish snapshots only where needed.
- If the store must remain the source of truth, batch updates per frame rather than per enemy.

### 8. Medium: Touch input is duplicated and driven by polling loops

Status: Fixed.

Verification note: `App` now consumes `useUnifiedControls()` directly, `useTouchControls()` is only instantiated there through that shared path, and the polling loops were replaced with event-driven updates.

Affected files:

- `src/App.tsx`
- `src/hooks/controls/useUnifiedControls.ts`
- `src/hooks/controls/useTouchControls.ts`

Why it matters:

- `App` instantiates `useTouchControls()` for joystick display.
- Gameplay also instantiates touch controls again inside `useUnifiedControls()`.
- Both `App` and `useUnifiedControls()` poll refs using `setInterval`.

Impact:

- Duplicate listeners and duplicated touch state.
- Risk that the visible joystick state and actual movement input drift apart.
- Mobile input logic is harder to debug than it needs to be.

Recommendation:

- Move touch input to a single control source shared by both gameplay and UI.
- Prefer event-driven updates or a shared ref store over multiple 60 FPS polling loops.

### 9. Medium: Type and config boundaries are too coarse for the current size of the project

Status: Partially Fixed.

Verification note: Config normalization extended to weapons, passives, enemies via `getWeapon`, `getPassive`, `getEnemy` in `weaponsNormalized.ts`, `passivesNormalized.ts`, `enemiesNormalized.ts`. `src/types.ts` remains a large catch-all; config files remain in aggregate form.

Affected files:

- `src/types.ts`
- `src/data/config/weaponsConfig.ts`
- `src/data/config/passives.ts`

Why it matters:

- `src/types.ts` is a catch-all for domain models, store contracts, projectile runtime types, animation, and UI-facing state.
- Config files are large and repetitive.

Impact:

- Navigation cost is higher than necessary.
- Unrelated changes are likely to collide in reviews.
- The codebase feels type-organized in some places and feature-organized in others.

Recommendation:

- Split types into narrower modules such as:
  - `types/domain`
  - `types/store`
  - `types/rendering`
  - `types/physics`
  - `types/upgrades`
- Break config into per-weapon/per-passive modules with index exports.

### 10. Medium: Naming conventions mix runtime camelCase with config snake_case across the whole app

Status: Fixed.

Verification note: Runtime consumers use normalized accessors (`getWeapon`, `getPassive`, `getEnemy`, `getCharacter`) returning camelCase (`spriteConfig`, `startingWeaponId`, etc.). Raw config snake_case kept at config boundary; weapon hooks, HUD, upgrade labels, Player, Enemy use normalized data.

Affected files:

- `src/types.ts`
- `src/data/config/characters.ts`
- `src/data/config/waves.ts`
- `src/data/config/weaponsConfig.ts`
- `src/data/config/passives.ts`

Why it matters:

- The project uses snake_case fields such as `starting_weapon_id`, `sprite_config`, `time_start`, `spawn_interval`, and `max_active`, while runtime code is mostly camelCase.

Impact:

- Readers constantly translate between two schemas.
- UI and gameplay code must carry storage-format concerns instead of operating on a normalized runtime model.

Recommendation:

- Normalize config at the boundary.
- Either keep raw config in snake_case and map it once into camelCase runtime types, or rename config contracts entirely.

### 11. Medium: Tooling and documentation drift reduce confidence

Status: Partially Fixed.

Verification note: Fixed: CI workflow (`.github/workflows/ci.yml`), README Node 22+, `@eslint/js` in package.json, README lists `yarn test --run`, PERFORMANCE_OPTIMIZATION_SUMMARY reflects current projectile architecture. Remaining: `vite.config.ts` @ts-nocheck (wyw-in-js plugin type recursion); one test failure in `weapons.test.ts`.

Affected files:

- `vite.config.ts`
- `eslint.config.js`
- `package.json`
- `README.md`
- `.nvmrc`
- `.github/workflows/deploy.yml`
- `PERFORMANCE_OPTIMIZATION_SUMMARY.md`

Why it matters:

- `vite.config.ts` is under `@ts-nocheck`.
- `README.md` says Node 18+, while `.nvmrc` pins Node 22.14.0.
- `eslint.config.js` imports `@eslint/js`, but `package.json` does not declare it.
- The only GitHub workflow is deployment; there is no separate CI quality gate.
- `PERFORMANCE_OPTIMIZATION_SUMMARY.md` states that the projectile refactor is broadly complete, but `ArcWeapon` still uses a separate legacy approach.

Impact:

- Local setup and repository docs are less trustworthy than they should be.
- Contributors have weaker signals on whether the main branch is healthy.

Recommendation:

- Align docs, runtime requirements, and package declarations.
- Add a dedicated CI workflow for install, lint, test, and build.
- Treat architectural summary docs as living documents and update them when migrations are partial rather than complete.

## Architecture Assessment

### What is working well

- The overall stack is well chosen for the problem: Vite, React 18, TypeScript, React Three Fiber, Rapier, and Zustand are a practical combination for a client-side action game.
- Content is sensibly data-driven. Characters, enemies, passives, and waves are defined in config instead of being hard-coded into render logic.
- The codebase is discoverable at the top level. `components`, `hooks`, `store`, `data/config`, and `utils` make initial orientation easy.
- There is clear awareness of performance-sensitive areas. Instanced rendering and centralized projectile intent are good signs.

### Architectural weaknesses

- Domain ownership is blurry. Core events such as enemy death, progression, and weapon evolution are resolved across hooks and store actions rather than through authoritative domain commands.
- The repo is organized partly by layer and partly by feature. Weapons in particular span config, store logic, hooks, utilities, and components, so a single feature change can cross many directories.
- Hooks are doing too much orchestration. Several of them combine simulation, side effects, state mutation, physics interaction, and UI-facing concerns.
- The code is in an awkward middle state between component-driven logic and data-oriented simulation. That is the biggest architectural tension in the project.

## Technology Review

### Strong choices

- `Vite` is a strong fit for this kind of browser game project.
- `React Three Fiber` is appropriate for scene management and integration with React UI.
- `Rapier` is reasonable for collisions and bodies where true physics is needed.
- `Zustand` is a good lightweight state container for game-adjacent UI and global session state.
- `Storybook` is a positive investment for UI iteration, even if it is not yet used as a regression layer.

### Concerns

- `Zustand` is currently overused for frame-rate simulation state.
- `Rapier` is still being used for projectile paths that appear better suited to manual batched simulation.
- `Linaria` plus `@wyw-in-js/vite` is workable, but it increases tooling surface area; if it remains, the config should be fully typed and reliable.
- Quality tooling currently lacks trust because lint/test validation is not reproducible from the repo state I inspected.

## Readability And Maintainability

### Strengths

- The code is generally readable and comments are mostly purposeful.
- Pure utility modules such as weapon math and passive helpers are a good foundation.
- Thin wrapper weapon components are a good pattern when the hook owns the behavior.
- The game rules are explicit enough that a reviewer can reconstruct the intended behavior without reverse engineering everything from render code.

### Weaknesses

- Several hooks are too large in responsibility, especially enemy behavior, player behavior, and wave management.
- `src/types.ts` is too broad and now acts as a dumping ground.
- Repository conventions are defined but not enforced. Selector helpers, centralized ID generation, and performance utilities exist, but usage is inconsistent.
- Naming schema inconsistency adds avoidable cognitive load.

## Refactoring Plan

### Phase 0: Stabilize correctness before architecture changes

- Fix XP carryover and multi-level progression.
- Fix evolution choice semantics.
- Centralize enemy death resolution and remove double kill counting.
- Fix wave culling to use live positions.

This phase should be covered by focused unit tests before deeper refactors begin.

### Phase 1: Separate simulation from UI state

- Keep pause/menu/session/progression UI state in Zustand.
- Move projectile and enemy position simulation into frame-owned mutable structures or system managers.
- Publish only the minimal snapshots needed by UI and selection logic.

Goal:

- prevent frame-rate state churn from driving global rerenders and store cloning.

### Phase 2: Extract pure gameplay reducers and planners

- Turn progression, upgrade generation, weapon evolution, enemy-death resolution, and wave spawn planning into pure functions.
- Pass time, randomness, and IDs as inputs rather than reading globals directly.

Goal:

- make the hardest logic deterministic, testable, and independent from React.

### Phase 3: Unify the weapon runtime model

- Choose a documented model for projectile-capable weapons.
- Migrate `ArcWeapon` into the shared projectile pipeline or explicitly define a second supported weapon runtime with a shared interface.
- Remove obsolete legacy projectile files after migration.

Goal:

- make new weapons cheaper to implement and easier to reason about.

### Phase 4: Reorganize by feature in volatile areas

- Start with weapons and progression.
- Co-locate config, runtime logic, rendering adapter, and tests for a feature or weapon family.
- Split `src/types.ts` into focused modules.

Goal:

- reduce change surface and improve navigation.

### Phase 5: Normalize tooling and contributor trust signals

- Fix package declarations and lint configuration.
- Align `README.md`, `.nvmrc`, and workflow Node versions.
- Add CI for install, lint, test, and build.
- Update architecture/performance docs so they describe the current state rather than the intended end state.

Goal:

- restore trust that repository docs and automation match reality.

## Test Strategy Recommendations

The highest-value new tests are not visual tests first; they are deterministic rule tests.

Recommended priorities:

1. `gameStore` progression tests
   - XP overflow
   - repeated level-ups
   - upgrade choice generation
   - evolution replacement

2. enemy lifecycle tests
   - damage to death
   - reward spawning
   - kill counting
   - removal/deregistration

3. wave manager tests
   - spawn cadence
   - `max_active`
   - culling correctness
   - pause behavior

4. weapon runtime tests
   - cooldown cadence
   - projectile creation
   - duration expiry
   - special behaviors such as bounce/orbit/nearest-target

5. mobile input tests
   - touch activation/deactivation
   - joystick normalization
   - touch versus keyboard precedence

6. CI-level verification
   - lint
   - unit tests
   - production build

## Overall Assessment

This is a promising codebase with a strong game-specific foundation, but it has reached the point where correctness and architecture need to catch up with feature growth. The main risk is not that the project is poorly written; it is that its most important gameplay rules are spread across too many layers and runtime models. That is fixable, and the refactoring path is clear.

If the team executes Phase 0 and Phase 1 well, the rest of the cleanup becomes much easier. If it does not, future feature work will continue to accumulate hidden bugs and performance regressions in the same hotspots already visible today.
