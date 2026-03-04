/**
 * Phaser-specific runtime configuration.
 *
 * All magic numbers that were previously scattered across scenes and core
 * classes live here. Shared game-data configs (weapons, enemies, characters,
 * waves, viewport, UI strings, animation maps) remain under `src/data/config/`
 * and are imported directly from there.
 */

// ---------------------------------------------------------------------------
// Gameplay simulation
// ---------------------------------------------------------------------------
export const PHASER_GAMEPLAY = {
  /** How often contact damage from enemies can tick (milliseconds). */
  PLAYER_DAMAGE_INTERVAL_MS: 500,

  /** Player hit radius in world units. */
  PLAYER_COLLISION_RADIUS: 0.7,

  /** Projectile hit radius in world units. */
  PROJECTILE_COLLISION_RADIUS: 0.5,

  /** Radius within which XP orbs are instantly collected (world units). */
  ORB_PICKUP_RADIUS: 0.45,

  /** Radius within which XP orbs begin homing toward the player (world units). */
  ORB_ATTRACT_RADIUS: 2.5,

  /** Speed at which attracted orbs move toward the player (world units / second). */
  ORB_ATTRACT_SPEED: 10,

  /** Display size (world units) of a passive XP orb. */
  ORB_DISPLAY_IDLE: 0.6,

  /** Display size (world units) of an XP orb that is currently attracted. */
  ORB_DISPLAY_ATTRACTED: 0.8,

  /** How far outside the visible viewport enemies spawn (world units). */
  ENEMY_SPAWN_MARGIN: 2,

  /**
   * Enemies beyond this multiple of the viewport half-extent are culled.
   * E.g. 2.5 means enemies more than 2.5× the screen radius are removed.
   */
  ENEMY_CULL_MULTIPLIER: 2.5,

  /**
   * Multiplier applied to each enemy's base speed.
   * Increase to make the game feel faster / harder.
   */
  ENEMY_SPEED_MULTIPLIER: 2,

  /**
   * Multiplier applied to each projectile's base speed.
   * Should generally stay in sync with ENEMY_SPEED_MULTIPLIER.
   */
  PROJECTILE_SPEED_MULTIPLIER: 2,

  /** Minimum enemy collision radius (world units), preventing point-sized hitboxes. */
  ENEMY_COLLISION_RADIUS_MIN: 0.35,

  /** Enemy collision radius as a fraction of the sprite scale. */
  ENEMY_COLLISION_RADIUS_SCALE: 0.28,

  /** Angular velocity for orbital projectiles (radians / second). */
  ORBIT_ANGULAR_SPEED: 3,

  /** Multiplier applied to a weapon's `area` stat to determine orbital radius. */
  ORBIT_RADIUS_SCALE: 1.5,

  /** Downward acceleration applied to arc projectiles (world units / second²). */
  ARC_GRAVITY: 9.8,

  /** Projectile visual spin speed (radians added per rendered frame). */
  PROJECTILE_ROTATION_SPEED: 0.08,

  /**
   * Angle offset between consecutive directional-spread projectiles (radians).
   * Only applies to weapons of type `projectile_directional`.
   */
  PROJECTILE_SPREAD_STEP: 0.1,
} as const;

// ---------------------------------------------------------------------------
// Background rendering
// ---------------------------------------------------------------------------
export const PHASER_BG = {
  /**
   * World-unit size of one background tile cell.
   * Smaller values → denser tiling. Larger values → sparser tiling.
   * This should match the legacy `GRID_UNIT_SIZE` feel from the R3F app.
   */
  GRID_UNIT_SIZE: 0.2,
} as const;

// ---------------------------------------------------------------------------
// Phaser engine / renderer
// ---------------------------------------------------------------------------
export const PHASER_RENDERER = {
  /** Canvas clear / letterbox colour. */
  BACKGROUND_COLOR: "#111111",

  /** Desired frames per second. */
  TARGET_FPS: 60,

  /** Enables pixel-art rendering (no texture smoothing). */
  PIXEL_ART: true,

  /** Rounds sprite positions to whole pixels to avoid sub-pixel shimmer. */
  ROUND_PIXELS: true,
} as const;

// ---------------------------------------------------------------------------
// Sprites / rendering
// ---------------------------------------------------------------------------
export const PHASER_SPRITES = {
  /** Fallback sprite-sheet frame size when none is declared in the asset config. */
  DEFAULT_FRAME_SIZE: 32,

  /** Frame size used for the XP orb sprite sheet. */
  ORB_FRAME_SIZE: 36,
} as const;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
export const PHASER_INPUT = {
  /** Outer ring radius of the touch joystick (screen pixels). */
  JOYSTICK_BASE_RADIUS: 56,

  /** Movable knob radius of the touch joystick (screen pixels). */
  JOYSTICK_KNOB_RADIUS: 24,

  /**
   * Dead-zone threshold: axis values whose absolute value is below this are
   * treated as zero to eliminate drift from an imprecise finger release.
   */
  JOYSTICK_DEAD_ZONE: 0.08,

  /** Distance from the left/bottom edge of the screen for the joystick anchor. */
  JOYSTICK_MARGIN: 90,
} as const;

// ---------------------------------------------------------------------------
// HUD / UI
// ---------------------------------------------------------------------------
export const PHASER_HUD = {
  /** Default button width in pixels (can be overridden per call-site). */
  BUTTON_DEFAULT_WIDTH: 320,

  /** Button height in pixels. */
  BUTTON_HEIGHT: 56,

  /** Button label font size. */
  BUTTON_FONT_SIZE: "22px",

  /** Total width of the XP progress bar (pixels). */
  XP_BAR_WIDTH: 280,

  /** Height of the XP progress bar (pixels). */
  XP_BAR_HEIGHT: 14,

  /** Total width of the health bar (pixels). */
  HEALTH_BAR_WIDTH: 400,

  /** Height of the health bar (pixels). */
  HEALTH_BAR_HEIGHT: 20,

  /** Width and height of weapon icon thumbnails in the HUD (pixels). */
  WEAPON_ICON_SIZE: 44,

  /** Width of the level-up choice panel (pixels). */
  LEVEL_UP_PANEL_WIDTH: 560,

  /** Height of the level-up choice panel (pixels). */
  LEVEL_UP_PANEL_HEIGHT: 440,

  /** Alpha of the darkening overlay behind the level-up panel. */
  LEVEL_UP_BG_ALPHA: 0.72,

  /** Alpha of the level-up panel background. */
  LEVEL_UP_PANEL_ALPHA: 0.96,
} as const;
