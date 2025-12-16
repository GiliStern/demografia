import type { Camera } from "three";

export interface ViewportBounds {
  halfWidth: number;
  halfHeight: number;
  width: number;
  height: number;
}

/**
 * Calculate the visible world-space bounds for an orthographic camera
 * In Vampire Survivors style, this represents the player's visible area
 */
export function getViewportBounds(camera: Camera, zoom: number): ViewportBounds {
  // For orthographic camera, calculate visible area based on viewport size and zoom
  // Access the actual rendering canvas size
  const canvas = document.querySelector("canvas");
  const width = canvas
    ? canvas.clientWidth / zoom
    : window.innerWidth / zoom;
  const height = canvas
    ? canvas.clientHeight / zoom
    : window.innerHeight / zoom;

  return {
    halfWidth: width / 2,
    halfHeight: height / 2,
    width,
    height,
  };
}

/**
 * Check if a position is within viewport bounds (relative to camera/player position)
 */
export function isInViewport(
  position: { x: number; y: number },
  cameraPosition: { x: number; y: number },
  bounds: ViewportBounds,
  margin = 0
): boolean {
  const relativeX = Math.abs(position.x - cameraPosition.x);
  const relativeY = Math.abs(position.y - cameraPosition.y);

  return (
    relativeX <= bounds.halfWidth + margin &&
    relativeY <= bounds.halfHeight + margin
  );
}

/**
 * Get a random spawn position just outside the viewport
 * Used for Vampire Survivors-style enemy spawning
 */
export function getSpawnPositionOutsideViewport(
  playerPosition: { x: number; y: number },
  bounds: ViewportBounds,
  spawnMargin = 2
): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;

  // Choose whether to spawn on horizontal or vertical edge
  const spawnOnVertical = Math.abs(Math.sin(angle)) > Math.abs(Math.cos(angle));

  let x: number, y: number;

  if (spawnOnVertical) {
    // Spawn above or below
    const side = Math.sin(angle) > 0 ? 1 : -1;
    x = playerPosition.x + (Math.random() * 2 - 1) * bounds.halfWidth;
    y = playerPosition.y + side * (bounds.halfHeight + spawnMargin);
  } else {
    // Spawn left or right
    const side = Math.cos(angle) > 0 ? 1 : -1;
    x = playerPosition.x + side * (bounds.halfWidth + spawnMargin);
    y = playerPosition.y + (Math.random() * 2 - 1) * bounds.halfHeight;
  }

  return { x, y };
}

/**
 * Calculate maximum distance before enemies should be culled
 * Returns distance from player where enemies should despawn
 */
export function getCullDistance(bounds: ViewportBounds, multiplier = 2): number {
  // Calculate diagonal distance of viewport and multiply by the given factor
  const diagonal = Math.sqrt(bounds.width ** 2 + bounds.height ** 2);
  return diagonal * multiplier;
}

