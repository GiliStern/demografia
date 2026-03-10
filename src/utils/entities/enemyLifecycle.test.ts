import { describe, expect, it } from "vitest";
import { buildEnemyDeathRewards } from "./enemyLifecycle";

describe("enemyLifecycle", () => {
  it("builds deterministic death rewards with a caller-provided orb id", () => {
    const rewards = buildEnemyDeathRewards({
      position: { x: 12, y: -4 },
      xpValue: 30,
      createOrbId: () => "xp-test-id",
    });

    expect(rewards).toEqual({
      xpOrb: {
        id: "xp-test-id",
        position: { x: 12, y: -4 },
        xpValue: 30,
      },
      goldReward: 1,
      killIncrement: 1,
    });
  });

  it("supports custom gold rewards when needed", () => {
    const rewards = buildEnemyDeathRewards({
      position: { x: 0, y: 0 },
      xpValue: 80,
      goldReward: 3,
      createOrbId: () => "xp-elite",
    });

    expect(rewards.goldReward).toBe(3);
    expect(rewards.xpOrb.xpValue).toBe(80);
  });
});
