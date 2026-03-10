import { describe, it, expect } from "vitest";
import {
  createSpreadProjectiles,
  createDirectionalProjectiles,
  buildVelocity,
} from "./weaponProjectiles";

describe("weaponProjectiles", () => {
  describe("createSpreadProjectiles", () => {
    it("creates correct number of projectiles", () => {
      const projectiles = createSpreadProjectiles({
        amount: 5,
        baseVelocity: { x: 1, y: 0 },
        spreadStep: 0.1,
        position: { x: 0, y: 0, z: 0 },
        damage: 10,
        duration: 2,
        idFactory: (i) => `p-${i}`,
      });
      expect(projectiles).toHaveLength(5);
      expect(projectiles.map((p) => p.id)).toEqual([
        "p-0",
        "p-1",
        "p-2",
        "p-3",
        "p-4",
      ]);
    });

    it("applies spread offset to velocities", () => {
      const projectiles = createSpreadProjectiles({
        amount: 3,
        baseVelocity: { x: 5, y: 0 },
        spreadStep: 1,
        position: { x: 0, y: 0, z: 0 },
        damage: 10,
        duration: 2,
        idFactory: (i) => `p-${i}`,
      });
      const [p0, p1, p2] = projectiles;
      expect(p0?.velocity.x).toBe(4);
      expect(p1?.velocity.x).toBe(5);
      expect(p2?.velocity.x).toBe(6);
    });
  });

  describe("createDirectionalProjectiles", () => {
    it("creates one projectile per direction", () => {
      const directions = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
      ];
      const projectiles = createDirectionalProjectiles({
        directions,
        speed: 10,
        position: { x: 0, y: 0, z: 0 },
        damage: 8,
        duration: 1.5,
        idFactory: (i) => `d-${i}`,
      });
      expect(projectiles).toHaveLength(3);
      const [d0, d1, d2] = projectiles;
      expect(d0?.velocity).toEqual({ x: 10, y: 0 });
      expect(d1?.velocity).toEqual({ x: 0, y: 10 });
      expect(d2?.velocity).toEqual({ x: -10, y: 0 });
    });
  });

  describe("buildVelocity", () => {
    it("scales direction by speed", () => {
      const v = buildVelocity({ x: 3, y: 4 }, 10);
      expect(v.x).toBeCloseTo(6);
      expect(v.y).toBeCloseTo(8);
    });
  });
});
