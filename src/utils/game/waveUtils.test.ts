import { describe, expect, it } from "vitest";
import { EnemyId } from "@/types";
import {
  countActiveEnemiesOfType,
  filterEnemiesWithinCullDistance,
  resolveEnemyWorldPosition,
} from "./waveUtils";

describe("waveUtils", () => {
  it("prefers the live tracked position over the spawn position", () => {
    const enemy = {
      id: "enemy-1",
      typeId: EnemyId.StreetCats,
      position: [50, 50, 0] as [number, number, number],
    };

    const resolved = resolveEnemyWorldPosition(enemy, {
      "enemy-1": { x: 2, y: 3 },
    });

    expect(resolved).toEqual({ x: 2, y: 3 });
  });

  it("keeps enemies that moved close to the player even if they spawned far away", () => {
    const enemies = [
      {
        id: "enemy-near",
        typeId: EnemyId.StreetCats,
        position: [100, 100, 0] as [number, number, number],
      },
      {
        id: "enemy-far",
        typeId: EnemyId.Hipster,
        position: [20, 20, 0] as [number, number, number],
      },
    ];

    const filtered = filterEnemiesWithinCullDistance(
      enemies,
      {
        "enemy-near": { x: 1, y: 1 },
        "enemy-far": { x: 30, y: 30 },
      },
      { x: 0, y: 0 },
      10,
    );

    expect(filtered).toEqual([enemies[0]]);
  });

  it("counts active enemies by type", () => {
    const enemies = [
      {
        id: "enemy-1",
        typeId: EnemyId.StreetCats,
        position: [0, 0, 0] as [number, number, number],
      },
      {
        id: "enemy-2",
        typeId: EnemyId.StreetCats,
        position: [1, 0, 0] as [number, number, number],
      },
      {
        id: "enemy-3",
        typeId: EnemyId.Hipster,
        position: [2, 0, 0] as [number, number, number],
      },
    ];

    expect(countActiveEnemiesOfType(enemies, EnemyId.StreetCats)).toBe(2);
    expect(countActiveEnemiesOfType(enemies, EnemyId.Hipster)).toBe(1);
  });
});
