/**
 * Viewport and camera configuration for Vampire Survivors-style gameplay
 */
export const VIEWPORT_CONFIG = {
  /** Orthographic camera zoom level - higher = more zoomed in */
  CAMERA_ZOOM: 40,

  /** Distance in world units outside viewport where enemies spawn */
  ENEMY_SPAWN_MARGIN: 2,

  /** Multiplier of viewport diagonal for enemy culling distance */
  ENEMY_CULL_MULTIPLIER: 2,

  /** Optional margin for bounce weapon reflection boundaries */
  BOUNCE_MARGIN: 0.5,
} as const;

