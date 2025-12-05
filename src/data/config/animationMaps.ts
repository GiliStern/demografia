export type AnimationConfig = {
  frames: number[];
  frameRate: number;
  loop: boolean;
};

type AnimationSet = Record<string, AnimationConfig>;
type AnimationCategory = Record<string, AnimationSet>;

type AnimationMaps = {
  characters: AnimationCategory;
  enemies: AnimationCategory;
  weapons: AnimationCategory;
};

export const ANIMATION_MAPS: AnimationMaps = {
  characters: {
    default: {
      idle: { frames: [0], frameRate: 1, loop: true },
      run: { frames: [0, 1], frameRate: 8, loop: true },
      idle_up: { frames: [2], frameRate: 1, loop: true },
      run_up: { frames: [2, 3], frameRate: 8, loop: true },
    },
  },
  enemies: {
    default: {
      walk: { frames: [0, 1], frameRate: 6, loop: true },
    },
  },
  weapons: {
    default: {
      idle: { frames: [0], frameRate: 0, loop: false },
    },
  },
};

export type AnimationCategoryKey = keyof typeof ANIMATION_MAPS;
