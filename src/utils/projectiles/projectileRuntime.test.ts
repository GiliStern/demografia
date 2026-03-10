import { describe, expect, it } from "vitest";
import { WeaponId, type CentralizedProjectile } from "@/types";
import { advanceProjectile } from "./projectileRuntime";

const createProjectile = (
  overrides: Partial<CentralizedProjectile> = {},
): CentralizedProjectile => ({
  id: "projectile-1",
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 10, y: 5 },
  damage: 1,
  textureUrl: "test.png",
  spriteIndex: 0,
  spriteFrameSize: 32,
  scale: 1,
  spawnTime: 0,
  duration: 2,
  weaponId: WeaponId.Pitas,
  behaviorType: "normal",
  ...overrides,
});

describe("advanceProjectile", () => {
  it("moves linear projectiles using their current velocity", () => {
    const nextState = advanceProjectile(createProjectile(), 0.5);

    expect(nextState.position).toEqual({ x: 5, y: 2.5, z: 0 });
    expect(nextState.velocity).toEqual({ x: 10, y: 5, z: 0 });
  });

  it("applies acceleration before moving arc projectiles", () => {
    const nextState = advanceProjectile(
      createProjectile({
        velocity: { x: 4, y: 8 },
        acceleration: { x: 0, y: -10 },
        behaviorType: "arc",
      }),
      0.5,
    );

    expect(nextState.velocity).toEqual({ x: 4, y: 3, z: 0 });
    expect(nextState.position).toEqual({ x: 2, y: 1.5, z: 0 });
  });
});
