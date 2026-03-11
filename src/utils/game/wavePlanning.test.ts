import { describe, it, expect } from "vitest";
import {
  findCurrentWave,
  shouldSpawnEnemy,
  getEnemyTypesToSpawn,
} from "./wavePlanning";
import { EnemyId } from "@/types";
import type { WaveDataRuntime } from "@/data/normalizeConfig";
import type { ActiveEnemy } from "@/types/hooks/game";

const stageWaves: WaveDataRuntime[] = [
  {
    timeStart: 0,
    timeEnd: 30,
    enemies: [
      { id: EnemyId.StreetCats, spawnInterval: 1.0, maxActive: 5 },
    ],
  },
  {
    timeStart: 30,
    timeEnd: 60,
    enemies: [
      { id: EnemyId.StreetCats, spawnInterval: 1.0, maxActive: 3 },
      { id: EnemyId.Hipster, spawnInterval: 2.0, maxActive: 2 },
    ],
  },
];

describe("findCurrentWave", () => {
  it("returns wave when timer is within range", () => {
    expect(findCurrentWave(stageWaves, 0)).toEqual(stageWaves[0]);
    expect(findCurrentWave(stageWaves, 15)).toEqual(stageWaves[0]);
    expect(findCurrentWave(stageWaves, 30)).toEqual(stageWaves[1]);
    expect(findCurrentWave(stageWaves, 45)).toEqual(stageWaves[1]);
  });

  it("returns undefined when timer is outside all waves", () => {
    expect(findCurrentWave(stageWaves, -1)).toBeUndefined();
    expect(findCurrentWave(stageWaves, 60)).toBeUndefined();
    expect(findCurrentWave(stageWaves, 100)).toBeUndefined();
  });
});

describe("shouldSpawnEnemy", () => {
  it("returns true when under max and interval elapsed", () => {
    expect(
      shouldSpawnEnemy(
        { id: EnemyId.StreetCats, spawnInterval: 1.0, maxActive: 5 },
        2,
        0,
        1.5
      )
    ).toBe(true);
  });

  it("returns false when at max active", () => {
    expect(
      shouldSpawnEnemy(
        { id: EnemyId.StreetCats, spawnInterval: 1.0, maxActive: 5 },
        5,
        0,
        10
      )
    ).toBe(false);
  });

  it("returns false when interval not elapsed", () => {
    expect(
      shouldSpawnEnemy(
        { id: EnemyId.StreetCats, spawnInterval: 1.0, maxActive: 5 },
        0,
        5,
        5.5
      )
    ).toBe(false);
  });
});

describe("getEnemyTypesToSpawn", () => {
  it("returns enemy types that should spawn this frame", () => {
    const enemies: ActiveEnemy[] = [
      { id: "e1", typeId: EnemyId.StreetCats, position: [0, 0, 0] },
    ];
    const tracker = { [EnemyId.StreetCats]: { lastSpawn: 0 } };
    const wave = stageWaves[1]!;
    const now = 2.5;

    const toSpawn = getEnemyTypesToSpawn(wave, enemies, tracker, now);
    expect(toSpawn).toContain(EnemyId.Hipster);
    expect(toSpawn).toContain(EnemyId.StreetCats);
  });

  it("excludes type when at max active", () => {
    const enemies: ActiveEnemy[] = [
      { id: "e1", typeId: EnemyId.StreetCats, position: [0, 0, 0] },
      { id: "e2", typeId: EnemyId.StreetCats, position: [0, 0, 0] },
      { id: "e3", typeId: EnemyId.StreetCats, position: [0, 0, 0] },
    ];
    const tracker = { [EnemyId.StreetCats]: { lastSpawn: 0 } };
    const wave = stageWaves[1]!;
    const now = 5.0;

    const toSpawn = getEnemyTypesToSpawn(wave, enemies, tracker, now);
    expect(toSpawn).not.toContain(EnemyId.StreetCats);
  });
});
