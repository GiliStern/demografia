import { beforeEach, describe, expect, it } from "vitest";
import { WeaponId, type CentralizedProjectile } from "@/types";
import { useGameStore } from "./gameStore";

const createProjectile = (
  id: string,
  overrides: Partial<CentralizedProjectile> = {},
): CentralizedProjectile => ({
  id,
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 1, y: 0 },
  damage: 10,
  textureUrl: "test.png",
  spriteIndex: 0,
  spriteFrameSize: 32,
  scale: 1,
  spawnTime: 0,
  duration: 2,
  weaponId: WeaponId.Sabra,
  behaviorType: "normal",
  ...overrides,
});

const resetProjectileStore = () => {
  useGameStore.getState().clearProjectiles();
};

describe("projectilesStore registry", () => {
  beforeEach(() => {
    resetProjectileStore();
  });

  it("tracks projectile membership through getProjectileCount", () => {
    const store = useGameStore.getState();

    store.addProjectile(createProjectile("p1"));
    store.addProjectiles([createProjectile("p2"), createProjectile("p3")]);

    expect(store.getProjectileCount()).toBe(3);
    expect(store.getProjectilesArray().map((projectile) => projectile.id)).toEqual(
      ["p1", "p2", "p3"],
    );

    store.removeProjectile("p2");
    expect(store.getProjectileCount()).toBe(2);
    expect(store.getProjectile("p2")).toBeUndefined();
  });

  it("stores projectile acceleration for runtime-driven motion", () => {
    const store = useGameStore.getState();

    store.addProjectile(
      createProjectile("arc-1", {
        acceleration: { x: 0, y: -9.8 },
        behaviorType: "arc",
      }),
    );

    expect(store.getProjectile("arc-1")).toEqual(
      expect.objectContaining({
        acceleration: { x: 0, y: -9.8 },
        behaviorType: "arc",
      }),
    );
  });
});
