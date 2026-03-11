# State Architecture

This document describes how state is organized in Demografia and when to use each access pattern.

## State Ownership

| Store / Manager | Owns | Purpose |
|-----------------|------|---------|
| **sessionStore** | `isRunning`, `isPaused`, `runTimer`, `level`, `xp`, `gold`, `killCount`, `upgradeChoices`, `selectedCharacterId`, etc. | Gameflow, menus, level-up flow |
| **playerStore** | `playerPosition`, `playerDirection`, `currentHealth`, `playerStats` | Player state and effective stats (cached) |
| **weaponsStore** | `activeWeapons`, `weaponLevels`, `activeItems`, `passiveLevels` | Weapon/passive ownership and levels; `getWeaponStats` (cached) |
| **gameStore** | Composes viewport, XP orbs, projectiles store slices | Viewport bounds, XP orb list, projectile add/remove |
| **ProjectileManager** | Active projectile positions, velocities, lifetimes | Per-frame projectile simulation (ref-backed) |
| **EnemyManager** | Active enemy roster (position, HP, type) | Per-frame enemy simulation (ref-backed) |

## Access Patterns

### Zustand Selectors (React Components)

Use narrow selectors in React components to minimize re-renders:

```ts
// Good: subscribe only to what you need
const isPaused = useSessionStore((state) => state.isPaused);
const playerPosition = usePlayerStore((state) => state.playerPosition);

// Avoid: subscribing to the whole store
// const state = useSessionStore((state) => state); // BAD
```

### GameplayContext (Simulation and Hooks)

For simulation systems and frame-driven hooks, use `getGameplayContext()`:

```ts
import { getGameplayContext } from "@/simulation/gameplayContext";

const ctx = getGameplayContext();
const playerPos = ctx.getPlayerPosition();
ctx.addProjectiles(projectiles);
```

The context provides:
- **Read APIs:** `getPlayerPosition`, `getPlayerDirection`, `getEffectivePlayerStats`, `getWeaponStats`, `getEnemyPositions`, `getViewportBounds`, `getSessionState`
- **Command APIs:** `addProjectiles`, `applyDamageToEnemy`, `reportContactDamage`
- **Tick contexts:** `getProjectileTickContext()`, `getEnemyTickContext()` for manager ticks

### Imperative getState() (Hot Paths Only)

For frame loops where you must avoid React re-renders, use `getState()` through the helpers in `gameStoreAccess`:

```ts
import { getPlayerPositionSnapshot } from "@/store/gameStoreAccess";

// Inside useFrame - no React subscription
const pos = getPlayerPositionSnapshot();
```

Prefer `GameplayContext` when the caller already has a context; use `gameStoreAccess` helpers when you need a one-off snapshot.

## Testing

Inject a fake `GameplayContext` for tests:

```ts
import { setGameplayContext, getGameplayContext } from "@/simulation/gameplayContext";

beforeEach(() => setGameplayContext(null)); // Reset to default

it("uses fake context", () => {
  setGameplayContext({
    getPlayerPosition: () => ({ x: 10, y: 20 }),
    // ... other methods
  });
  const ctx = getGameplayContext();
  expect(ctx.getPlayerPosition()).toEqual({ x: 10, y: 20 });
});
```

## Derived Stats Caching

- **playerStore:** `getEffectivePlayerStats()` is cached; invalidated when passives or base stats change.
- **weaponsStore:** `getWeaponStats(weaponId)` is cached per weapon; invalidated when weapon levels, passives, or active items change.

Treat these as read-only inputs in hooks; do not recompute them per frame.
