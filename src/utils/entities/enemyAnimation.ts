/**
 * Shared enemy animation logic - used by enemyManager and Storybook preview.
 * Single source of truth so Storybook accurately reflects in-game rendering.
 *
 * Each enemy texture has its own sprite sheet with frames 0,1 for walk.
 * The config "index" is not used for animation (it was for a combined spritesheet).
 */

export const ENEMY_RUN_FRAMES = [0, 1] as const;
export const ENEMY_RUN_FRAME_RATE = 8;

export function getEnemySpriteIndex(
  currentTime: number,
  _baseSpriteIndex: number,
  isMoving: boolean
): number {
  if (!isMoving) return ENEMY_RUN_FRAMES[0];
  const runFrameIndex =
    Math.floor(currentTime * ENEMY_RUN_FRAME_RATE) % ENEMY_RUN_FRAMES.length;
  return ENEMY_RUN_FRAMES[runFrameIndex] ?? 0;
}

/**
 * Spinning animation for projectiles (shouldSpin weapons).
 * Cycles frames [0, 1] at 8fps - same as enemy walk.
 * Only use when sprite has 2 frames.
 */
export function getSpinningSpriteIndex(currentTime: number): number {
  const frameIndex =
    Math.floor(currentTime * ENEMY_RUN_FRAME_RATE) % ENEMY_RUN_FRAMES.length;
  return ENEMY_RUN_FRAMES[frameIndex] ?? 0;
}
