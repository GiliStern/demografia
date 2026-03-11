# Weapon Runtime Models

Demografia supports two weapon runtime models. New weapons should use one of these; do not introduce additional architectures.

## 1. Centralized Projectile Runtime

**Used by:** Sabra, Keter Chairs, Pitas, Star of David, Burekas of Death, Thousand Edge, No Future, Holy Cactus, and similar flying-projectile weapons.

**Flow:**
1. Weapon hook (e.g. `useArcWeapon`, `useBounceWeapon`) fires by calling `addProjectiles()` on the game store.
2. Projectiles are added to the projectile manager (`src/simulation/projectileManager.ts`).
3. `BatchedProjectileRenderer` runs the manager's `tick()` each frame (advance, expiry, collision, bounce).
4. Rendering uses GPU instancing over a snapshot from the manager. No per-projectile React components or physics bodies.

**Behavior types:** `normal`, `bounce`, `homing`, `arc` — all handled inside the manager.

**To add a new projectile weapon:** Implement a hook that calls `addProjectiles()` with `CentralizedProjectile` data; add a thin component that invokes the hook and returns `null`.

## 2. Orbit Runtime

**Used by:** Kaparot, Unholy Selichot (orbiting bodies around the player).

**Flow:**
1. `useOrbitWeapon` manages local state for orbiters (angle, radius, spawn time).
2. `OrbitWeapon` component renders `OrbitingBody` for each orbiter.
3. Each `OrbitingBody` uses a Rapier kinematic body for collision and `usePauseAwareFrame` for position updates.

**Why separate:** Orbiting bodies are persistent, player-centered, and need Rapier collision for enemy hits. They do not fit the fly-and-expire projectile model.

**To add a new orbit weapon:** Follow the `useOrbitWeapon` + `OrbitingBody` pattern; ensure the weapon is registered in `ActiveWeapons`.
