import * as THREE from "three";

interface SetupRepeatingTextureParams {
  texture: THREE.Texture;
  planeSize: number;
  gridUnitSize: number;
}

/**
 * Prepares a texture for infinite tiling on a large plane using repeat wrapping.
 */
export const setupRepeatingTexture = ({
  texture,
  planeSize,
  gridUnitSize,
}: SetupRepeatingTextureParams) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(planeSize / gridUnitSize, planeSize / gridUnitSize);
  texture.needsUpdate = true;
};

/**
 * Wraps a numeric value into the half-open interval [0, 1).
 * Useful for UV offsets so values stay stable even as positions grow.
 */
const wrapToUnitInterval = (value: number) => {
  const m = value % 1;
  return m < 0 ? m + 1 : m;
};

interface GetRepeatedTextureOffsetsParams {
  x: number;
  y: number;
  gridUnitSize: number;
}

/**
 * Converts a world position to stable, wrapped UV offsets for repeated textures.
 */
export const getRepeatedTextureOffsets = ({
  x,
  y,
  gridUnitSize,
}: GetRepeatedTextureOffsetsParams) => ({
  offsetX: wrapToUnitInterval(x / gridUnitSize),
  offsetY: wrapToUnitInterval(y / gridUnitSize),
});
