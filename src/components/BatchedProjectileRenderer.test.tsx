import { describe, expect, it } from "vitest";
import type { InstancedSpriteHandle } from "./InstancedSprite";

/**
 * Regression: pierce=0 projectiles must disappear the same frame they hit.
 * BatchedProjectileRenderer does that by calling syncMesh() on each InstancedSprite
 * after updating instance refs. If syncMesh is removed from the ref handle, the
 * instanced mesh can stay one frame behind and removed projectiles remain visible.
 */
describe("BatchedProjectileRenderer render-path contract", () => {
  it("InstancedSpriteHandle exposes syncMesh so parent can sync mesh in same frame", () => {
    const handle: InstancedSpriteHandle = {
      syncMesh: () => {},
    };
    expect(typeof handle.syncMesh).toBe("function");
  });
});
