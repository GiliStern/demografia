# Demografia — Expert Codebase Review

**Date:** 2026-03-10
**Scope:** Full static analysis of 124 TypeScript/TSX source files (~12,100 LOC), build configuration, CI, and test suite.
**Branch:** `review-and-refactor`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Codebase Metrics](#codebase-metrics)
3. [Architecture Review](#architecture-review)
4. [Technology Assessment](#technology-assessment)
5. [Code Quality & Readability](#code-quality--readability)
6. [Performance Analysis](#performance-analysis)
7. [Testing Assessment](#testing-assessment)
8. [Detailed Findings](#detailed-findings)
9. [Refactoring Plan](#refactoring-plan)

---

## Executive Summary

Demografia is a browser-based arcade survivor game (React 18 + TypeScript + React Three Fiber + Vite 5) with no backend. The codebase is ~12,100 LOC across 124 source files with a clear top-level structure and data-driven game content.

**Strengths:**
- Appropriate technology stack for a client-side 2D game.
- Data-driven content design (weapons, passives, enemies, waves, characters) with clean normalization layer.
- Intentional performance work: instanced rendering, centralized projectile manager, mutable enemy position registry.
- Good TypeScript strictness settings (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Pure utility modules for weapon math, wave planning, and projectile runtime are well-isolated and testable.

**Critical Issues:**
- The Zustand store is a 7-slice mega-store that mixes UI state, gameplay state, and frame-rate simulation concerns into a single object. This is the project's central architectural bottleneck.
- ~1,200 lines of performance infrastructure (`objectPools.ts`, `spatialPartitioning.ts`, `optimizedProjectilePhysics.ts`, `stressTest.ts`) are built but **never wired into the game loop** — dead code that adds maintenance burden without benefit.
- React state updates are triggered inside `useFrame` loops (per-frame `setState` calls in `BatchedProjectileRenderer` and `useWaveManager`), defeating the intended performance optimization of the centralized projectile manager.
- Weapon hooks follow 3-4 different patterns for the same fundamental operation (fire-on-cooldown), making new weapons expensive to implement and reason about.
- ESLint `react-hooks/exhaustive-deps` is **disabled**, removing the primary safety net for hook correctness.

---

## Codebase Metrics

| Metric | Value |
|---|---|
| Source files (`.ts`/`.tsx`) | 124 |
| Total LOC (source) | ~12,100 |
| Test files | 10 |
| Test LOC | ~592 |
| Test coverage ratio | ~4.9% by LOC |
| Store slices | 7 (game, player, enemies, weapons, viewport, xpOrbs, projectiles) |
| Weapon types | 10 (5 base + 5 evolutions) |
| Weapon hook variants | 6 (projectile, nearest, bounce, radial, arc, orbit) |
| Config files | 15 (5 raw + 5 normalized + normalizeConfig + 4 other) |
| Utility modules | 20+ |
| Component files | 25+ |
| Dead/unused modules | ~4 files, ~1,200 LOC |

### File Size Distribution (Top 15)

| File | LOC | Concern |
|---|---|---|
| `data/config/passives.ts` | 627 | Repetitive level definitions |
| `types.ts` | 503 | Monolithic type barrel |
| `data/config/weaponsConfig.ts` | 408 | Large, could be split per weapon |
| `store/gameStore.ts` | 390 | Store + upgrade logic mixed |
| `utils/performance/objectPools.ts` | 335 | **Unused** |
| `utils/performance/spatialPartitioning.ts` | 333 | **Unused** |
| `utils/testing/stressTest.ts` | 285 | **Unused** |
| `utils/performance/optimizedProjectilePhysics.ts` | 249 | **Unused** |
| `utils/passives/passiveUtils.ts` | 234 | Duplicated apply logic |
| `hooks/controls/useTouchControls.ts` | 212 | Complex, well-documented |
| `hooks/entities/useEnemyBehavior.ts` | 211 | Movement + damage + death + animation |
| `hooks/rendering/useInstancedSprite.ts` | 207 | Custom shader material |
| `utils/performance/performanceMonitor.ts` | 198 | Class-based, console-only |

---

## Architecture Review

### Overall Structure

```
src/
├── components/          # React components (scene, UI, weapons, screens)
├── data/config/         # Game content definitions + normalized accessors
├── hooks/               # React hooks (controls, entities, game, rendering, weapons)
├── simulation/          # Projectile manager (frame-owned mutable state)
├── store/               # Zustand store slices + access adapters
├── styles/              # Global CSS-in-JS
├── types/               # Additional type definitions
├── types.ts             # Main type barrel (504 lines)
└── utils/               # Pure utilities (weapons, rendering, performance, etc.)
```

The directory layout is mostly layer-based (`components/`, `hooks/`, `store/`, `utils/`) with feature pockets inside (`weapons/`, `entities/`, `controls/`). This is reasonable at this scale, but the split means a single feature like "add a new weapon" touches 5-7 directories.

### Architectural Patterns

#### 1. Mega-Store Anti-Pattern

The entire game state lives in a single Zustand store composed of 7 slices:

```
GameStore = GameSlice & PlayerStore & EnemiesStore & WeaponsStore
          & ViewportStore & XpOrbsStore & ProjectilesStore
```

This creates several problems:

- **Coupling:** Every component that needs any piece of state has a path to mutate everything. `useEnemyBehavior` calls `addXpOrb`, `addGold`, `addKill`, `registerEnemy`, `updateEnemyPosition`, `removeEnemy`, and `registerEnemyDamageCallback` — all from the same store reference.
- **Selector pressure:** Components must use precise selectors to avoid unnecessary re-renders, but the flat namespace makes it easy to accidentally subscribe to more state than needed.
- **Testing friction:** Testing any slice requires instantiating the full composite store because slices use `get()` to call methods from other slices (e.g., `playerStore.takeDamage` calls `get().endGame()` from `gameSlice`).

#### 2. Three Competing Execution Models

The codebase uses three different approaches for entity state, with no clear boundary between them:

| Model | Used By | State Location | Update Mechanism |
|---|---|---|---|
| Rapier physics bodies | Player, Enemies, Orbit weapon, XP orbs | Rapier world | `setLinvel()`, `setNextKinematicTranslation()` |
| Centralized mutable manager | Projectiles | `projectileManager.ts` (singleton) | `manager.tick()` in `useFrame` |
| React state in hooks | Wave manager enemies list | `useState` in `useWaveManager` | `setEnemies()` per frame |

This mixed model means:
- Enemies are Rapier physics bodies whose positions are also manually synced to a Zustand registry every frame.
- Projectiles live in a ref-backed manager but are rendered by a React component that calls `setBatchKeys` (React state) inside `useFrame`.
- The wave manager's enemy list is React state that gets filtered per frame via `setEnemies`.

#### 3. Domain Logic Diffusion

Core gameplay rules are spread across hooks, store actions, and utility functions without a clear ownership model:

- **Enemy death:** `useEnemyBehavior.handleDeath()` creates rewards, increments kills, and calls `onDeath`. `useWaveManager.removeEnemy()` removes from the active list. The damage callback registered in the enemies store bridges them.
- **Level progression:** `gameStore.addXp()` calls `resolveLevelProgression()` (pure function, good), then `buildUpgradeChoices()` (reads from store state). `applyUpgrade()` dispatches to `addWeapon`/`levelUpWeapon`/`addPassive`/`levelUpPassive` on the weapons slice.
- **Weapon firing:** Each weapon hook independently implements the fire-on-cooldown loop in `useFrame`, with varying degrees of shared utility usage.

#### 4. Config Normalization — Good Pattern, Repetitive Implementation

The normalization layer (snake_case config → camelCase runtime) is a sound design decision. However, the 5 `*Normalized.ts` files are nearly identical 25-line modules with the same cache-and-normalize pattern. This could be a single generic utility.

### Architectural Strengths

- **Data-driven content:** Characters, enemies, weapons, passives, and waves are all defined in config objects, not hard-coded in render logic.
- **Pure gameplay functions:** `resolveLevelProgression`, `buildUpgradeChoices`, `advanceProjectile`, `findCurrentWave`, `getEnemyTypesToSpawn`, `buildEnemyDeathRewards` are pure, deterministic, and testable.
- **Instanced rendering:** `useInstancedSprite` with custom shader material and `entityBatcher` for draw call reduction is a correct optimization path.
- **Store access adapters:** `gameStoreAccess.ts` isolates imperative `getState()` calls behind named functions, preventing ad-hoc store access in hot paths.

---

## Technology Assessment

### Stack Overview

| Technology | Version | Verdict |
|---|---|---|
| Vite | 5.x | Excellent fit. Fast HMR, production builds work. |
| React | 18.2 | Appropriate. R3F requires it. |
| TypeScript | 5.3 | Good. Strict mode enabled with strong settings. |
| React Three Fiber | 8.16 | Right choice for React-based 3D/2D scene management. |
| Rapier (via @react-three/rapier) | 1.4 / 0.19 | Appropriate for collision detection. Overused for projectiles. |
| Zustand | 5.x | Good library, but misused as a frame-rate data transport layer. |
| Linaria / wyw-in-js | 7.x / 1.0 | **Questionable.** Adds build complexity for zero-runtime CSS-in-JS. The `@ts-nocheck` in `vite.config.ts` exists solely because this plugin's types are broken. |
| Storybook | 8.4 | Good investment for component development, but only 2 story files exist. |
| Vitest | 4.x | Good. Fast, Vite-native test runner. |

### Technology Concerns

**Linaria / wyw-in-js:** This is the highest-friction dependency in the build chain. It requires:
- `@babel/preset-react` and `@babel/preset-typescript` as explicit dependencies
- A separate Vite plugin with a `@ts-nocheck` suppression
- `displayName: true` configuration

All Linaria-styled components in the codebase (`AppContainer`, `CanvasContainer`, HUD elements, menus) use simple static styles that could be achieved with CSS modules, vanilla CSS, or even inline styles with zero build complexity. The zero-runtime benefit of Linaria is negligible in a game where the GPU is the bottleneck, not CSS parsing.

**Rapier for non-physics entities:** Rapier is used for player/enemy collision detection (sensor bodies), which is reasonable. However, the orbit weapon and XP orbs also use Rapier kinematic bodies, adding physics world overhead for entities that don't need physics simulation. The projectile migration away from Rapier is a correct direction.

**ESLint configuration:** The `exhaustive-deps` rule is disabled in `eslint.config.js`. This is a significant quality risk for a codebase that relies heavily on hooks with complex dependency arrays. Several hooks already contain `eslint-disable-next-line react-hooks/exhaustive-deps` comments, suggesting the team is aware of the tension but chose to disable the rule globally rather than fix individual cases.

---

## Code Quality & Readability

### Strengths

1. **Consistent naming within modules.** Functions are well-named (`buildWeaponRuntime`, `shouldFire`, `filterEnemiesWithinCullDistance`, `resolveDirection`).

2. **Thin components.** `Player.tsx` (44 lines), `Enemy.tsx` (48 lines), `ProjectileWeapon.tsx` (15 lines), `RadialWeapon.tsx` (15 lines) delegate all behavior to hooks, keeping render logic minimal.

3. **Good TypeScript discipline.** Enums for IDs (`WeaponId`, `PassiveId`, `EnemyId`, `CharacterId`), discriminated unions for `RigidBodyUserData`, and typed store creators (`StoreCreator<T>`).

4. **Purposeful comments.** Hebrew translations in enum comments, behavior explanations in hooks, and constraint documentation in utility functions.

5. **Config normalization boundary.** Raw config keeps the original format; runtime consumers use `getWeapon()`, `getEnemy()`, etc. for camelCase access. This is clean.

### Weaknesses

#### Monolithic Types File

`src/types.ts` (504 lines) contains:
- All game enums (`PassiveId`, `WeaponId`, `EnemyId`, `CharacterId`, `PauseReason`, `AnimationType`, etc.)
- All domain interfaces (`PlayerStats`, `WeaponStats`, `EnemyData`, `WaveData`, etc.)
- All store contracts (`GameState`, `PlayerStore`, `EnemiesStore`, `WeaponsStore`, etc.)
- Rendering types (`CentralizedProjectile`, `SpriteConfig`, `AnimationConfig`)
- UI types (`UpgradeOption`, `ActiveWeaponRenderItem`)

Every source file that needs any type imports from this single module. This is a classic barrel file anti-pattern that:
- Creates import cycles risk
- Makes refactoring expensive (every change touches the same file)
- Reduces discoverability (readers can't tell which types belong to which domain)

#### Inconsistent Weapon Hook Patterns

The 6 weapon hooks implement the same fundamental operation (fire projectiles on cooldown) with significant variation:

| Hook | Uses `buildWeaponRuntime`? | Uses `shouldFire`? | Position source | Maps to `CentralizedProjectile`? |
|---|---|---|---|---|
| `useProjectileWeapon` | Yes | Yes | `getPlayerPositionSnapshot()` | Yes |
| `useNearestProjectileWeapon` | Yes | Yes | `playerPosition` (selector) | Yes, duplicated in 2 paths |
| `useRadialWeapon` | Yes | Yes | `playerPosition` (selector) | Yes, missing `shouldSpin` |
| `useBounceWeapon` | **No** | **No** | `getPlayerPositionSnapshot()` | Yes |
| `useArcWeapon` | Yes | Yes | `getPlayerPositionSnapshot()` | Yes |
| `useOrbitWeapon` | **No** (custom `buildOrbitRuntime`) | **No** | `playerPosition` (selector) | N/A (Rapier bodies) |

`useBounceWeapon` manually computes damage, speed, duration, amount, and cooldown instead of using `buildWeaponRuntime`. It also uses `time - lastFireTime.current > cooldown` instead of the shared `shouldFire()` utility. This means if the cooldown formula changes, `useBounceWeapon` will behave differently from other weapons.

#### `ProjectileData` to `CentralizedProjectile` Mapping Duplication

The conversion from `ProjectileData` (local shot data) to `CentralizedProjectile` (centralized rendering data) is copy-pasted across all weapon hooks:

```typescript
const centralizedProjectiles: CentralizedProjectile[] = shots.map((shot) => ({
  id: shot.id,
  position: shot.position,
  velocity: shot.velocity,
  damage: shot.damage,
  textureUrl: weaponData.spriteConfig.textureUrl,
  spriteIndex: weaponData.spriteConfig.index,
  spriteFrameSize: weaponData.spriteConfig.spriteFrameSize ?? 32,
  scale: weaponData.spriteConfig.scale,
  spawnTime: time,
  duration: shot.duration,
  weaponId,
  behaviorType: "normal" as const,
  shouldSpin: weaponData.shouldSpin,
}));
```

This block appears 8 times across 4 files (once for immediate shots and once for staggered shots in hooks that use stagger). A single `toCentralizedProjectile()` utility would eliminate this.

#### Dead Code

Four modules totaling ~1,200 lines are built but never imported by any runtime code:

| File | LOC | Purpose |
|---|---|---|
| `utils/performance/objectPools.ts` | 335 | Object pooling for projectiles/enemies/orbs |
| `utils/performance/spatialPartitioning.ts` | 333 | Quadtree implementation |
| `utils/performance/optimizedProjectilePhysics.ts` | 249 | Alternative projectile physics engine |
| `utils/testing/stressTest.ts` | 285 | Stress testing utility |

These appear to be infrastructure built speculatively for future optimization. While the ideas are sound, maintaining 1,200 lines of dead code increases cognitive load and slows navigation. They should be removed and restored from git history if needed.

#### Verbose Config Definitions

`passives.ts` (627 lines) defines 14 passives with level-by-level stat changes. Most follow a linear scaling pattern (level N = base × N) that could be expressed declaratively:

```typescript
// Current: 50+ lines per passive
levels: [
  { level: 1, description: "...", statChanges: { add: { maxHealth: 10 } } },
  { level: 2, description: "...", statChanges: { add: { maxHealth: 10 } } },
  { level: 3, description: "...", statChanges: { add: { maxHealth: 10 } } },
  // ...
]

// Could be: 5 lines
scalingPattern: "linear",
baseAdd: { maxHealth: 10 },
maxLevel: 5,
```

---

## Performance Analysis

### Hot Path Issues

#### 1. React State Updates Inside `useFrame` (Critical)

**`BatchedProjectileRenderer`** calls `setBatchKeys()` (React state setter) inside every `useFrame` tick:

```typescript
useFrame((state, frameDelta) => {
  // ...
  setBatchKeys((prev) => {
    const next = new Set([...prev, ...keys]);
    if (next.size === prev.length) return prev;
    return [...next];
  });
  // ...
});
```

Even though the early-return optimization avoids unnecessary array creation when keys haven't changed, the `setState` call itself schedules a React reconciliation check. At 60 FPS, this is 60 React scheduler invocations per second in a component that was designed to avoid React overhead.

**`useWaveManager`** calls `setEnemies()` (React state setter) inside every `useFrame` tick for culling:

```typescript
useFrame(() => {
  // ...
  setEnemies((prev) => {
    const enemyPositions = getEnemyPositionsRegistrySnapshot();
    return filterEnemiesWithinCullDistance(prev, enemyPositions, playerPosition, cullDistance);
  });
  // ...
});
```

This creates a new filtered array and triggers React reconciliation on every frame. Even if no enemies were culled, `filterEnemiesWithinCullDistance` returns a new array reference.

#### 2. Object Allocation in Hot Paths

**`useEnemyBehavior`** allocates a `new THREE.Vector3()` on every frame for every enemy:

```typescript
useFrame(() => {
  const direction = new THREE.Vector3(
    playerPosition.x - rigidBody.current.translation().x,
    playerPosition.y - rigidBody.current.translation().y,
    0
  );
  // ...
});
```

With 30+ enemies, this is 30+ `Vector3` allocations per frame (1,800+/second at 60 FPS). A reusable `Vector3` ref would eliminate this entirely.

**`projectileManager.getSnapshot()`** creates a new array on every call via `Array.from(projectiles.values())`. It's called once per frame by `BatchedProjectileRenderer`, which is acceptable, but the pattern is worth noting for scale.

**`enemyEntries()`** in `projectileManager.ts` creates a new entries array via `Array.from(enemies.entries())` for every projectile collision check per frame.

#### 3. Zustand Selector Proliferation

`useEnemyBehavior` creates 9 separate Zustand subscriptions:

```typescript
const playerPosition = useGameStore((state) => state.playerPosition);
const isPaused = useGameStore((state) => state.isPaused);
const isRunning = useGameStore((state) => state.isRunning);
const updateEnemyPosition = useGameStore((state) => state.updateEnemyPosition);
const addXpOrb = useGameStore((state) => state.addXpOrb);
const addGold = useGameStore((state) => state.addGold);
const addKill = useGameStore((state) => state.addKill);
const registerEnemy = useGameStore((state) => state.registerEnemy);
const registerEnemyDamageCallback = useGameStore((state) => state.registerEnemyDamageCallback);
```

Since Zustand function references are stable, only `playerPosition`, `isPaused`, and `isRunning` cause re-renders. But with 30+ enemy components each subscribing to `playerPosition`, every player movement triggers 30+ component re-renders. The actual position-based movement happens in `useFrame` (which reads from the ref anyway), so `playerPosition` could be read from `getState()` instead.

### Performance Strengths

- **Mutable enemy position registry:** `enemiesStore.ts` uses a closure-scoped `Map` that mutates in place, avoiding Zustand state cloning.
- **Instanced rendering:** `useInstancedSprite` with custom shader material correctly batches draw calls for projectiles and other repeated sprites.
- **Projectile manager separation:** Moving projectile simulation out of Zustand into a ref-backed manager is the right architecture. The implementation needs refinement (see hot path issues above) but the direction is correct.
- **Frame delta clamping:** `BatchedProjectileRenderer` clamps delta to `[0, 0.5]` to prevent physics explosions from tab-away.

---

## Testing Assessment

### Current State

| Test File | Tests | Focus |
|---|---|---|
| `gameStore.test.ts` | 4 | XP overflow, queued level-ups, evolution choices, evolution application |
| `projectilesStore.test.ts` | 4 | Add/remove, count, array access, arc projectile storage |
| `enemiesStore.test.ts` | 3 | Register/update/remove, damage callbacks, reset |
| `weapons.test.ts` | 2 | Sabra level bonuses, max level cap (**1 known failure**) |
| `weaponMath.test.ts` | 3 | Nearest enemy, reflection, radial directions |
| `projectileRuntime.test.ts` | 2 | Linear advance, arc advance |
| `enemyLifecycle.test.ts` | 2 | Default rewards, custom rewards |
| `wavePlanning.test.ts` | 5 | Current wave, spawn decisions, spawn collection |
| `waveUtils.test.ts` | 3 | Position resolution, culling, type counting |
| `movementInput.test.ts` | 2 | Input activity check, touch/keyboard selection |

**Total: 30 tests, ~592 lines, 1 known failure.**

### Gaps

- **No tests for:** Weapon hooks, player behavior, touch controls, sprite animation, instanced rendering, pause/resume flow, game over flow, upgrade application flow, passive stat accumulation.
- **No integration tests:** No tests that exercise the game loop end-to-end (spawn → damage → death → reward → XP → level-up).
- **No performance tests:** No benchmarks for projectile count scaling, enemy count scaling, or frame budget.
- **Known failure:** `weapons.test.ts > resolveWeaponStats > applies Sabra level bonuses` fails due to expected stat values not matching the current weapon config.

### Testing Strengths

- Store tests use proper reset patterns and test state transitions.
- Pure utility tests are focused and deterministic.
- Test infrastructure (Vitest + node environment) is lightweight and fast.

---

## Detailed Findings

### F1 — Critical: Per-Frame React State Updates in BatchedProjectileRenderer

**File:** `src/components/BatchedProjectileRenderer.tsx:68-72`
**Impact:** Negates the performance benefit of the centralized projectile manager.

The `setBatchKeys` call inside `useFrame` triggers React's scheduler on every frame. Instead, batch keys should be tracked in a ref and only promoted to React state when the set of unique texture groups actually changes (which is rare — only when a new weapon type fires for the first time).

### F2 — Critical: Per-Frame Array Allocation in Wave Manager Culling

**File:** `src/hooks/game/useWaveManager.ts:88-97`
**Impact:** Creates GC pressure proportional to enemy count × frame rate.

`filterEnemiesWithinCullDistance` always returns a new array. Combined with `setEnemies` inside `useFrame`, this means React reconciliation runs on the enemy list 60 times per second. Culling should run on a throttled interval (e.g., every 500ms) or use a ref-backed structure.

### F3 — High: Dead Performance Infrastructure (~1,200 LOC)

**Files:** `objectPools.ts`, `spatialPartitioning.ts`, `optimizedProjectilePhysics.ts`, `stressTest.ts`
**Impact:** Maintenance burden, navigation noise, false sense of optimization coverage.

These modules define object pools, a quadtree, an alternative projectile physics engine, and stress testing utilities. None are imported by any runtime code. The actual game uses the `projectileManager` singleton for projectile physics and linear scans for collision detection.

### F4 — High: Inconsistent Weapon Hook Architecture

**Files:** All `src/hooks/weapons/use*.ts`
**Impact:** Each new weapon type requires reverse-engineering an existing hook. Bug fixes to firing logic must be applied to each variant independently.

The weapon hooks should share a common firing loop abstraction. A "weapon behavior descriptor" pattern would let each weapon define its unique aspects (targeting, spread, trajectory) while reusing cooldown management, projectile creation, and store dispatch.

### F5 — High: ESLint `exhaustive-deps` Disabled

**File:** `eslint.config.js`
**Impact:** Silent stale closure bugs in hooks. Multiple hooks already contain `// eslint-disable-next-line react-hooks/exhaustive-deps` overrides.

The `useEnemyBehavior` hook registers a damage callback on mount (`[id]` deps) that captures `handleDamage` from the first render. It works because `handleDamage` reads from `hpRef`, but this pattern is fragile and invisible to reviewers without the lint rule.

### F6 — Medium: Vector3 Allocation Per-Enemy Per-Frame

**File:** `src/hooks/entities/useEnemyBehavior.ts:168-172`
**Impact:** With N enemies at 60 FPS, creates 60N `Vector3` objects per second.

A single reusable `Vector3` declared as a module-level constant or a `useRef` would eliminate this allocation entirely.

### F7 — Medium: Monolithic Types File

**File:** `src/types.ts` (504 lines)
**Impact:** Every domain change touches this file. Merge conflicts are likely in team settings.

The existing `src/types/hooks/` directory shows intent to split types but the migration is incomplete. The main `types.ts` still contains store interfaces, domain models, rendering types, and UI types.

### F8 — Medium: XpOrbs Store Array Pattern

**File:** `src/store/xpOrbsStore.ts`
**Impact:** `addXpOrb` iterates the full orbs array to check for duplicates. `removeXpOrb` creates a new filtered array. At scale, this is O(N) per operation.

The duplicate-prevention comment says "CRITICAL FIX," suggesting this was a production bug. The root cause (duplicate IDs) should be fixed at the source rather than guarded in the store.

### F9 — Medium: `getProjectiles()` Creates a Map From an Array

**File:** `src/store/projectilesStore.ts:46-53`
**Impact:** Allocates a new `Map` from an array snapshot on every call.

```typescript
getProjectiles: () => {
  const snapshot = manager.getSnapshot();
  return new Map(snapshot.map((p) => [p.id, p]));
},
```

The manager already stores projectiles in a `Map`. This method should expose the map directly (or a read-only view) instead of round-tripping through an array.

### F10 — Medium: `getEffectivePlayerStats()` Called Every Render

**Files:** `usePlayerBehavior.ts`, `useProjectileWeapon.ts`, `useOrbitWeapon.ts`
**Impact:** Recalculates passive effects from scratch on every render and every `useFrame` tick.

`getEffectivePlayerStats()` calls `getAccumulatedPassiveEffects()`, which iterates all active passives and their levels. This is called both during render (for `playerStats` used in runtime computation) and inside `useFrame` (for `updatePlayerFrame`). The result should be cached and invalidated only when passives change.

### F11 — Low: Duplicate Screen Visibility Logic in App

**File:** `src/App.tsx:35-40, 106-112`
**Impact:** The same complex boolean expression for "is a menu visible" is written twice — once for `isMenuVisible` and once for `$menuVisible` prop.

```typescript
const isMenuVisible =
  showCharacterSelection ||
  (!showCharacterSelection && !isGameOver &&
    (!isRunning || (isPaused && pauseReason === PauseReason.Manual))) ||
  isGameOver;
```

This should be a single derived variable used in both places.

### F12 — Low: GameOver Uses `window.location.reload()`

**File:** `src/components/screens/GameOver.tsx`
**Impact:** Full page reload instead of in-app state reset. Loses any in-memory state (audio context, loaded textures, performance data).

The store already has `startGame()` which resets all state. The game over screen should use that path instead.

---

## Refactoring Plan

### Phase 0: Cleanup and Stabilize (1-2 days)

**Goal:** Remove noise, fix the failing test, and establish a reliable baseline.

| Task | Priority | Effort |
|---|---|---|
| Delete dead code: `objectPools.ts`, `spatialPartitioning.ts`, `optimizedProjectilePhysics.ts`, `stressTest.ts` | High | 30 min |
| Fix the failing `weapons.test.ts` test (align expected values with current config) | High | 30 min |
| Enable `react-hooks/exhaustive-deps` as `"warn"` and fix warnings | High | 2-4 hours |
| Extract duplicate `isMenuVisible` logic in `App.tsx` | Low | 15 min |
| Replace `window.location.reload()` in `GameOver` with `startGame()` | Low | 30 min |

### Phase 1: Eliminate Per-Frame React Overhead (1-2 days)

**Goal:** Stop `useFrame` callbacks from triggering React reconciliation.

| Task | Priority | Effort |
|---|---|---|
| `BatchedProjectileRenderer`: Track batch keys in a ref; only `setState` when set membership changes | Critical | 2 hours |
| `useWaveManager`: Throttle culling to 2-4 Hz instead of per-frame | Critical | 2 hours |
| `useEnemyBehavior`: Read `playerPosition` from `getState()` instead of selector; reuse a module-level `Vector3` | High | 1 hour |
| `usePlayerBehavior`: Audit all selectors; move stable functions to `getState()` reads | Medium | 1 hour |

### Phase 2: Unify the Weapon Runtime (2-3 days)

**Goal:** Make all weapons follow one firing pattern so new weapons are cheap to add.

| Task | Priority | Effort |
|---|---|---|
| Create a `WeaponBehaviorDescriptor` interface (targeting mode, spread, trajectory, stagger) | High | 2 hours |
| Create a single `useWeaponFiringLoop(descriptor)` hook that handles cooldown, firing, and centralized projectile dispatch | High | 4 hours |
| Extract a `toCentralizedProjectile()` utility to eliminate the 8× duplicated mapping | High | 1 hour |
| Migrate all 5 projectile-based weapon hooks to use `useWeaponFiringLoop` | Medium | 4 hours |
| Document the orbit weapon as a separate runtime model (non-projectile) with a shared interface | Low | 1 hour |

### Phase 3: Split the Zustand Store (2-3 days)

**Goal:** Separate UI/session state from frame-rate simulation state.

| Task | Priority | Effort |
|---|---|---|
| Extract `useGameSessionStore` (pause, level, xp, gold, upgradeChoices, runTimer) | High | 3 hours |
| Extract `useWeaponsStore` (activeWeapons, weaponLevels, passiveLevels, stat resolution) | High | 2 hours |
| Keep enemies/projectiles/viewport as simulation-only state (refs or dedicated managers) | High | 3 hours |
| Remove the composite `GameStore` type; replace with individual store imports | Medium | 2 hours |
| Add memoization to `getEffectivePlayerStats()` and `getAccumulatedPassiveEffects()` (invalidate on passive change) | Medium | 2 hours |

### Phase 4: Split Types and Reorganize (1-2 days)

**Goal:** Make the codebase navigable by feature rather than by layer.

| Task | Priority | Effort |
|---|---|---|
| Split `types.ts` into: `types/domain.ts`, `types/store.ts`, `types/rendering.ts`, `types/upgrades.ts`, `types/physics.ts` | High | 3 hours |
| Create a generic `createNormalizedAccessor<Raw, Runtime>()` to replace the 5 identical `*Normalized.ts` files | Medium | 1 hour |
| Consider per-weapon-family directories for volatile weapon code (config + hook + component + test) | Low | 2 hours |

### Phase 5: Expand Test Coverage (Ongoing)

**Goal:** Cover the highest-risk game logic with deterministic tests.

| Test Area | Priority | Estimated Tests |
|---|---|---|
| Weapon firing loop (cooldown, amount, spread) | High | 8-10 |
| Passive stat accumulation and application | High | 5-8 |
| Full upgrade flow (level-up → choose → apply → resume) | High | 4-6 |
| Enemy lifecycle (spawn → register → damage → death → reward → remove) | Medium | 5-7 |
| Wave manager (spawn cadence, max active, culling throttle) | Medium | 4-6 |
| Touch controls (dead zone, normalization, priority) | Low | 3-5 |

### Phase 6: Tooling Hardening (0.5-1 day)

**Goal:** Make CI and local dev trustworthy.

| Task | Priority | Effort |
|---|---|---|
| Remove `@ts-nocheck` from `vite.config.ts` (fix or properly type-assert the wyw-in-js import) | Medium | 30 min |
| Evaluate replacing Linaria with CSS modules to reduce build complexity | Medium | 2-4 hours |
| Add `--max-warnings 0` to the CI lint step (already in the checker plugin) | Low | 15 min |
| Add a bundle size check to CI (e.g., `vite-plugin-inspect` or `bundlesize`) | Low | 30 min |

---

## Summary

The codebase is past prototype stage and has clear architectural intent. The data-driven content model, pure gameplay functions, and instanced rendering show a team that thinks about the right problems. The main risks are not in the quality of individual functions but in the system-level execution model:

1. **The mega-store creates invisible coupling** between systems that should be independent.
2. **Per-frame React state updates** negate the performance wins from the centralized projectile manager.
3. **Six weapon hook variants** with no shared abstraction make the most common development task (adding weapons) expensive.
4. **~1,200 lines of dead code** create noise and a false sense of optimization.

The refactoring plan is ordered by impact: stabilize first, then fix the frame-rate performance issues, then unify the weapon model, then restructure the state architecture. Each phase delivers independent value and can be shipped incrementally.
