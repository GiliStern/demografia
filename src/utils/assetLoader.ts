import { TextureLoader, NearestFilter, SRGBColorSpace, Texture } from "three";

const loader = new TextureLoader();
const cache = new Map<string, Texture>();

export async function loadTexture(path: string): Promise<Texture> {
  if (cache.has(path)) return cache.get(path)!;

  const texture = await new Promise<Texture>((resolve, reject) => {
    loader.load(
      path,
      (tex) => resolve(tex),
      undefined,
      (err) => reject(new Error(String(err)))
    );
  });

  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.colorSpace = SRGBColorSpace;
  cache.set(path, texture);
  return texture;
}

export function clearTextureCache() {
  cache.clear();
}
