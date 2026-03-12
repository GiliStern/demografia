import type { XpOrbData } from "@/types";
import { generatePrefixedId } from "@/utils/common/idGenerator";

export interface EnemyDeathRewards {
  xpOrb: XpOrbData;
  goldReward: number;
  killIncrement: number;
}

interface BuildEnemyDeathRewardsInput {
  position: { x: number; y: number };
  xpValue: number;
  goldReward?: number;
  createOrbId?: () => string;
}

export const buildEnemyDeathRewards = ({
  position,
  xpValue,
  goldReward = 0,
  createOrbId = () => generatePrefixedId("xp"),
}: BuildEnemyDeathRewardsInput): EnemyDeathRewards => {
  return {
    xpOrb: {
      id: createOrbId(),
      position,
      xpValue,
    },
    goldReward,
    killIncrement: 1,
  };
};
