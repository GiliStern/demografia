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

  it("tracks projectile membership through projectileCount", () => {
    const store = useGameStore.getState();

    store.addProjectile(createProjectile("p1"));
    store.addProjectiles([createProjectile("p2"), createProjectile("p3")]);

    expect(useGameStore.getState().projectileCount).toBe(3);
    expect(store.getProjectilesArray().map((projectile) => projectile.id)).toEqual(
      ["p1", "p2", "p3"],
    );

    store.removeProjectile("p2");
    expect(useGameStore.getState().projectileCount).toBe(2);
    expect(store.getProjectile("p2")).toBeUndefined();
  });

  it("updates projectile runtime data without changing projectileCount", () => {
    const store = useGameStore.getState();

    store.addProjectile(createProjectile("p1"));
    const countBeforeUpdate = useGameStore.getState().projectileCount;

    store.updateProjectile("p1", {
      position: { x: 5, y: 3, z: 0 },
      velocity: { x: -1, y: 2 },
    });

    expect(useGameStore.getState().projectileCount).toBe(countBeforeUpdate);
    expect(store.getProjectile("p1")).toEqual(
      expect.objectContaining({
        position: { x: 5, y: 3, z: 0 },
        velocity: { x: -1, y: 2 },
      }),
    );
  });

  it("applies batched updates across multiple projectiles", () => {
    const store = useGameStore.getState();

    store.addProjectiles([createProjectile("p1"), createProjectile("p2")]);
    store.updateProjectiles([
      { id: "p1", updates: { position: { x: 1, y: 1, z: 0 } } },
      { id: "p2", updates: { position: { x: 2, y: 2, z: 0 } } },
    ]);

    expect(store.getProjectile("p1")?.position).toEqual({ x: 1, y: 1, z: 0 });
    expect(store.getProjectile("p2")?.position).toEqual({ x: 2, y: 2, z: 0 });
    expect(useGameStore.getState().projectileCount).toBe(2);
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
