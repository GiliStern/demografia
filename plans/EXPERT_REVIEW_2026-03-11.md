## Demografia — Expert Codebase Review (2026-03-11)

### Scope and Context

- **Project:** Demografia (React 18 + TypeScript + React Three Fiber + Vite 5)
- **Branch:** `review-and-refactor`
- **Source Size:** ~12k LOC, 130+ `.ts`/`.tsx` files
- **Inputs Reviewed:**
  - Existing review docs: `CODEBASE_REVIEW.md`, `EXPERT_REVIEW.md`, `PERFORMANCE_OPTIMIZATION_SUMMARY.md`
  - Core runtime: `App.tsx`, `simulation/projectileManager.ts`, `components/BatchedProjectileRenderer.tsx`
  - State: `store/gameStore.ts`, `store/weaponsStore.ts`, `store/sessionStore.ts`, `types/store.ts`
  - Domain and config: `types/domain.ts`, normalized config accessors, weapon utilities
  - Weapon runtime: `hooks/weapons/useWeaponFiringLoop.ts` and downstream helpers

This review is an **update** over the 2026‑03‑10 reviews, focusing on how the current codebase aligns with those findings and what remains to be improved.

---

### 1. Executive Summary

**Overall assessment:** The codebase has clearly moved in the right direction since the previous reviews. The most glaring issues (dead performance code, weapon-hook duplication, monolithic types, mixed simulation/UI responsibilities in a single mega-store) have been significantly reduced or removed. The architecture now better reflects the intended mental model: **centralized simulation**, **thin React components**, and **data-driven content**.

**What is working particularly well now:**

- **Centralized projectile simulation** (`projectileManager`) and **batched rendering** (`BatchedProjectileRenderer`) are coherent, well-encapsulated, and documented. The manager API (`addProjectiles`, `tick`, `getSnapshot`, `getMap`) is clean and testable.
- **Weapon runtime** has been unified through `useWeaponFiringLoop`, with a clear `WeaponBehaviorDescriptor` abstraction and a single `toCentralizedProjectile` mapping utility. This directly addresses the earlier criticism about 6 divergent weapon hooks.
- **State modeling** is better factored:
  - Session/gameflow lives in `sessionStore` (running/paused/game over, character selection, etc.).
  - Per-feature slices (viewport, XP orbs, projectiles) are isolated behind typed store creators.
  - Domain types have been split into `types/domain.ts`, `types/store.ts`, `types/rendering.ts`, `types/upgrades.ts`, instead of one 500‑line barrel.
- **Performance hot paths** show clear intent to avoid React re-renders and per-frame store writes. `BatchedProjectileRenderer` uses refs for batch data and only promotes batch keys to React state when texture groups actually change.

**Remaining structural risks / opportunities:**

- **Zustand is still the global coordination layer** for many systems. While slices are more focused, the global `useGameStore` pattern and wide access to store functions from hooks means coupling is still higher than ideal.
- **Simulation/state boundaries are not fully explicit.** Projectile simulation is cleanly isolated, but enemy simulation, wave scheduling, and some player behavior still mix “frame loop” concerns with store mutation and React hooks.
- Some **derived calculations (e.g., effective player stats)** are still computed eagerly in hooks rather than cached at the store/domain boundary.
- Tooling and docs are generally aligned, but tests remain focused more on pure utilities than on end-to-end game flows.

The remainder of this document focuses on the *current* state (not past issues) and proposes a concrete, incremental refactoring plan.

---

### 2. Architecture and Technologies

#### 2.1 High-Level Architecture

- **UI Shell:** `App.tsx` orchestrates session state (menus, character selection, in-game HUD, game over) via `useSessionStore`. It derives `showMainMenu` and `isMenuVisible` cleanly once and reuses those booleans for both UI visibility and control activation.
- **Scene and Simulation:**
  - `GameCanvas` (and children) host the React Three Fiber scene.
  - `BatchedProjectileRenderer` runs the projectile manager tick and renders projectile snapshots via instanced sprites.
  - Enemy and player behavior are encapsulated in hooks bound to R3F `useFrame`.
- **State Management:**
  - `sessionStore` handles lifecycle: running/paused/game over, selected character, pause reason, etc.
  - `weaponsStore` is a dedicated Zustand store for weapon/passive ownership and levels, including `getWeaponStats` and aggregated passive effects.
  - `gameStore` composes viewport, XP orbs, and projectiles into one lightweight store for rendering-adjacent state.
  - `gameStoreAccess` provides named adapters for imperative `getState()` access from hot paths.
- **Domain and Config:**
  - `types/domain.ts` defines enums and core data structures (`WeaponId`, `PassiveId`, `EnemyData`, `WaveData`, `PlayerStats`, etc.).
  - Normalized config (`*Normalized.ts`) decouples raw snake_case config from camelCase runtime usage.
  - `weaponUtils`, `weaponLifecycle`, `weaponProjectiles`, `projectileRuntime`, and `enemyLifecycle` implement pure gameplay rules in a testable way.

Overall, the architecture has converged toward three clear layers:

- **Domain rules:** pure, deterministic logic.
- **Simulation systems:** projectile manager, enemy manager, wave manager, movement.
- **Presentation and control:** React components and R3F hooks.

This is a strong direction for a browser-only action game.

#### 2.2 Technology Choices

- **React 18, TypeScript, Vite 5, React Three Fiber, Rapier, Zustand** remain appropriate and well-integrated.
- **Linaria + `@wyw-in-js/vite`**: this CSS-in-JS setup is working but still adds some complexity; it’s acceptable given current usage, and components like `AppContainer` are concise and readable.
- **Testing Stack (Vitest)**: focused on utilities, stores, and specific simulation behavior. The infrastructure is good, but broader coverage is still an opportunity.

No technology stands out as a liability at this point; the remaining work is mostly architectural and ergonomics-related.

---

### 3. Code Quality and Readability

#### 3.1 Strengths

- **Thin components and focused hooks.**
  - `App.tsx` is a good example: UI logic is explicit, side effects (`keydown` listener) are scoped and dependency-correct, and rendering is declarative and straightforward.
  - Weapon components are essentially “bind and forget” wrappers around `useWeaponFiringLoop`.
- **Clear domain modeling.**
  - Enums like `WeaponId`, `PassiveId`, `EnemyId`, `FloorPickupId`, and `PauseReason` make intent explicit and reduce stringly-typed bugs.
  - `PlayerStats`, `WeaponStats`, `EnemyData`, and `WaveData` are well-structured and documented (with Hebrew comments where appropriate).
- **Type organization greatly improved.**
  - `types/domain.ts` + `types/store.ts` is a significant improvement over the previous monolithic `types.ts`.
  - Store interfaces describe responsibilities clearly (`GameSlice`, `WeaponsStore`, `ViewportStore`, `ProjectilesStore`, etc.).
- **Good encapsulation in simulation manager.**
  - `ProjectileManager`’s interface is crisp: it exposes mutation (add/remove) and read APIs (`getSnapshot`, `getMap`, `getProjectile`, `getCount`) without leaking the internal `Map` as a mutable structure outside of its methods.
  - Collision logic (`segmentIntersectsCircle`) and bounce behavior (`reflectInBounds`) are kept as small, testable helpers.

#### 3.2 Weaknesses / Opportunities

- **Store surface area is still broad.**
  - `useWeaponsStore`, `useSessionStore`, and `useGameStore` are often consumed directly by hooks instead of going through narrow selectors or accessors. This is manageable now but may become noisy as features grow.
- **Derived calculations are sometimes eager.**
  - `useWeaponFiringLoop` computes `playerStats`, `weaponData`, and `stats` on render, and then uses them inside `useFrame`. This is fine for now, but as passive count grows, repeated `getEffectivePlayerStats` and `getWeaponStats` calls may become more expensive.
- **Implicit cross-store coupling can still surprise.**
  - The weapon firing loop uses both `weaponsStore` and `playerStore` plus `gameStoreAccess` utilities. The coupling is explicit in the code, but there is no single “gameplay context” abstraction stitching these together, so readers must know about multiple stores.

On balance, the code is readable, well-typed, and consistent. The remaining issues are more about architectural polish than about local code smell.

---

### 4. Notable Improvements vs. Previous Reviews

Compared to the 2026‑03‑10 reviews:

- **Dead performance infrastructure removed.**
  - Files like `objectPools.ts`, `spatialPartitioning.ts`, `optimizedProjectilePhysics.ts`, and `stressTest.ts` no longer appear in `src/`, eliminating ~1,200 LOC of unused code.
- **Weapon runtime unified.**
  - `useWeaponFiringLoop.ts` plus `WeaponBehaviorDescriptor` and `toCentralizedProjectile` consolidate firing logic and projectile mapping that previously lived in multiple, slightly divergent hooks.
- **Types and config boundaries clarified.**
  - `types/domain.ts`, `types/store.ts`, `types/rendering.ts`, `types/upgrades.ts`, and `types/index.ts` replace a single monolithic `types.ts` file, improving navigation and reducing merge risk.
- **Projectile manager and renderer tightened.**
  - `BatchedProjectileRenderer` no longer updates Zustand per frame and only calls `setBatchKeys` when texture groups change. Instanced sprite updates are pushed via refs with explicit `syncMesh()` calls to keep visual state in sync with simulation.
- **Session vs. in-game state separation.**
  - `sessionStore` now owns high-level gameflow concerns (menus, pause reasons, game over), keeping `GameCanvas` and simulation code more focused on the running session.

These improvements collectively validate the previously proposed refactor direction and reduce both cognitive and runtime overhead.

---

### 5. Current Architectural Risks and Gaps

#### 5.1 Global Store Coupling

- **Issue:** Multiple systems (weapons, player behavior, wave manager, enemy behavior) coordinate via direct access to various stores. Even with helpers like `gameStoreAccess`, the mental model is still “reach into the global store for whatever you need.”
- **Impact:** As more systems are added (e.g., elites, bosses, new pickup types), the chance of subtle cross-system coupling grows. Testing individual slices in isolation also becomes harder when they implicitly depend on other stores.

**Recommendation:** Move toward a more explicit “gameplay context” or “simulation context” abstraction:

- Define a `GameplayContext` interface that groups:
  - Read-only selectors for player, enemies, weapons, passives, viewport.
  - Command-style methods for domain events (`spawnEnemy`, `enqueueReward`, `applyDamage`, `levelUp`, `applyUpgrade`, etc.).
- Provide this context to simulation systems (projectile manager, enemy manager, wave manager) as injected dependencies rather than letting them directly import stores.

#### 5.2 Simulation Boundaries for Non-Projectile Systems

- **Issue:** Projectile simulation is cleanly centralized, but enemy movement, wave scheduling, and XP orbs still mix:
  - Frame-loop logic (`useFrame`) inside React components/hooks.
  - Direct store updates for positions or active lists.
- **Impact:** Reasoning about per-frame work and performance is harder outside the projectile path. For example, enemy update frequency, culling cadence, and wave activation logic are spread across multiple hooks and stores.

**Recommendation:**

- Introduce a small, testable `enemyManager` API similar to `projectileManager`, responsible for:
  - Active enemy roster and positions.
  - Applying movement and damage.
  - Emitting “death” events that can be consumed by reward/XP pipelines.
- Make wave scheduling and culling operate against that manager rather than maintaining their own parallel lists.

#### 5.3 Derived Stats and Caching

- **Issue:** `useWeaponFiringLoop` calls `getEffectivePlayerStats` and `getWeaponStats` at render time and then uses the resulting `runtime` inside `useFrame`. While this is not currently a hot bottleneck, it will grow with the number of passives and weapons.
- **Impact:** As the passive system grows, these calculations may become a non-trivial part of frame budget or cause subtle bugs if they’re recomputed in more than one place with slightly different inputs.

**Recommendation:**

- Move derived stat computation to the store boundary:
  - Keep a cached effective stat object in `playerStore` / `weaponsStore` that is recomputed only when underlying levels or base stats change.
  - Expose these via `getEffectivePlayerStats()` / `getWeaponStats()` that are guaranteed stable between level-ups/passive changes.
- In hooks like `useWeaponFiringLoop`, treat these as **inputs** rather than recomputation sites.

#### 5.4 Testing Gaps (End-to-End Flows)

- Existing tests do a good job covering:
  - Level progression, upgrade choices, and partial enemy lifecycle.
  - Projectile runtime math and wave planning logic.
- Less coverage exists for:
  - “Whole loop” scenarios (spawn → move → collide → die → reward → XP → level-up → upgrade).
  - Integration between weapon firing, projectile manager, and enemy damage callbacks.

**Recommendation:**

- Add a small set of **integration-style Vitest tests** that:
  - Instantiate a minimal “fake world” (1 player, 1 weapon, 1 enemy).
  - Step the projectile manager tick over a few frames.
  - Assert on enemy HP, rewards, and XP after simulation.

---

### 6. Refactoring Plan (Current State Forward)

This plan assumes the previous refactors are already in place (as they are now) and focuses on the **next** gains.

#### Phase 1 — Solidify Simulation Boundaries (1–2 days)

- **Goals:** Make simulation systems first-class, like the projectile manager; reduce implicit store coupling.

- **Tasks:**
  - Define an `EnemyManager` module analogous to `ProjectileManager`:
    - In-memory roster (id → stats/position/state).
    - Methods for spawn, move, applyDamage, markDead.
    - A `tick(delta, ctx)` method owning movement and death checks.
  - Refactor enemy-related hooks to:
    - Use the manager as the source of truth for positions and state.
    - Use store(s) primarily for UI-facing or analytics-style data (kills, XP, gold).
  - Move wave scheduling to drive `EnemyManager` directly instead of parallel arrays in React state.

#### Phase 2 — Introduce a Gameplay Context Abstraction (1–2 days)

- **Goals:** Replace ad-hoc multi-store access in hooks with an explicit, injectable context.

- **Tasks:**
  - Define a `GameplayContext` interface that groups:
    - Read APIs: player stats/position/direction, enemies snapshot, viewport, time.
    - Command APIs: spawnProjectile(s), applyDamage, spawnRewards, applyUpgrade, etc.
  - Implement a default context backed by the current stores and managers.
  - Update `useWeaponFiringLoop`, `projectileManager`, and (new) `enemyManager` to depend on `GameplayContext` rather than importing stores directly.

#### Phase 3 — Derived Stats and Caching (1 day)

- **Goals:** Ensure expensive stat aggregation is computed once per change, not per hook.

- **Tasks:**
  - In `playerStore` and `weaponsStore`:
    - Cache `effectivePlayerStats` and `effectiveWeaponStats` (per weapon) and recompute them only when base stats, weapon levels, or passive levels change.
  - Update `useWeaponFiringLoop` to treat `runtime` as a read-only snapshot for the duration of a frame; avoid recomputing “inputs” inside `useFrame`.

#### Phase 4 — Store Surface Area Tightening (1 day)

- **Goals:** Make each component/hook’s dependencies explicit and minimal.

- **Tasks:**
  - Replace `useWeaponsStore((state) => state)`-style access (if present) with the minimal selectors required.
  - Where possible, rely on narrow accessors from `gameStoreAccess` / a new `gameplaySelectors` module.
  - Document store usage patterns in a short `docs/STATE_ARCHITECTURE.md`:
    - What belongs in `sessionStore` vs. `weaponsStore` vs. simulation managers.
    - Guidelines for when to use selectors vs. imperative `getState()` calls.

#### Phase 5 — Integration Tests for Core Loops (ongoing)

- **Goals:** Gain high confidence in core loops as they become more modular.

- **Tasks:**
  - Add Vitest suites for:
    - “One enemy, one weapon, one projectile” loop.
    - Level-up + upgrade choice + apply upgrade + resume.
    - Simple multi-enemy wave spawn, cull, and death reward.
  - Keep these tests at the domain/simulation layer (no React) by using stores/managers directly.

---

### 7. Final Assessment

The Demografia codebase has matured significantly: it now reflects a clear architectural vision with centralized simulation, data-driven content, and intentionally optimized hot paths. The remaining work is less about fixing glaring problems and more about **polishing boundaries**—between stores and simulation, between domain and presentation, and between per-frame logic and derived state.

If you execute the phases above (especially creating an `enemyManager` and a `GameplayContext`), you will end up with a codebase that not only performs well but is also **trivially testable** and **pleasant to extend** for new weapons, enemies, and game modes.

