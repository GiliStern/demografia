import { describe, it, expect } from "vitest";
import {
  nearestEnemyDirection,
  reflectInBounds,
  radialDirections,
} from "./weaponMath";

describe("weaponMath helpers", () => {
  it("finds nearest enemy direction", () => {
    const dir = nearestEnemyDirection(
      { x: 0, y: 0 },
      {
        a: { x: 5, y: 0 },
        b: { x: 2, y: 0 },
      }
    );
    expect(dir).toEqual({ x: 1, y: 0 });
  });

  it("reflects velocity at bounds", () => {
    // Projectile at x=21, player at x=0, right bound at x=20 (0+20)
    // Velocity x=1 (moving right), should reflect to -1
    const vel = reflectInBounds(
      { x: 21, y: 0 }, // projectile position
      { x: 1, y: 1 },  // velocity
      { x: 0, y: 0 },  // player position
      20,              // halfWidth
      20               // halfHeight
    );
    expect(vel.x).toBe(-1);
    expect(vel.y).toBe(1);
  });

  it("creates radial directions", () => {
    const dirs = radialDirections(4);
    expect(dirs).toHaveLength(4);
    expect(dirs[0]).toEqual({ x: 1, y: 0 });
  });
});

