import {
  AnimationCategory,
  AnimationType,
  type AnimationConfig,
  AnimationVariant,
} from "@/types";

interface AnimationVariantData
  extends Partial<Record<AnimationType, AnimationConfig>> {
  [AnimationType.Idle]: AnimationConfig;
}

type AnimationCategoryData = Record<AnimationVariant, AnimationVariantData>;
type AnimationsByCategory = Record<AnimationCategory, AnimationCategoryData>;

export const ANIMATIONS_BY_CATEGORY: AnimationsByCategory = {
  [AnimationCategory.Characters]: {
    [AnimationVariant.Default]: {
      [AnimationType.Idle]: { frames: [0], frameRate: 1, loop: true },
      [AnimationType.Run]: { frames: [0, 1], frameRate: 8, loop: true },
      [AnimationType.IdleUp]: { frames: [2], frameRate: 1, loop: true },
      [AnimationType.RunUp]: { frames: [2, 3], frameRate: 8, loop: true },
    },
  },
  [AnimationCategory.Enemies]: {
    [AnimationVariant.Default]: {
      [AnimationType.Idle]: { frames: [0], frameRate: 1, loop: true },
      [AnimationType.Run]: { frames: [0, 1], frameRate: 8, loop: true },
    },
  },
  [AnimationCategory.Weapons]: {
    [AnimationVariant.Default]: {
      [AnimationType.Idle]: { frames: [0, 1], frameRate: 8, loop: true },
    },
  },
};
