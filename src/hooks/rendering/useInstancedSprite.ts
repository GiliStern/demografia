import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import type {
  UseInstancedSpriteParams,
  UseInstancedSpriteReturn,
  InstanceData,
} from "@/types/hooks/rendering";

// Re-export for convenience
export type { InstanceData };

/**
 * Custom hook for GPU-instanced sprite rendering with per-instance sprite animation
 */
export function useInstancedSprite({
  textureUrl,
  spriteFrameSize,
  instances,
  maxInstances,
}: UseInstancedSpriteParams): UseInstancedSpriteReturn {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const texture = useTexture(textureUrl);

  // Configure texture once (shared across all instances)
  useEffect(() => {
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  // Calculate sprite sheet dimensions
  const { cols, rows } = useMemo(() => {
    if (!texture.image) return { cols: 1, rows: 1 };
    const image = texture.image as HTMLImageElement;
    const c = Math.max(1, Math.floor(image.width / spriteFrameSize));
    const r = Math.max(1, Math.floor(image.height / spriteFrameSize));
    return {
      cols: c,
      rows: r,
    };
  }, [texture, spriteFrameSize, textureUrl]);

  // Custom shader material for per-instance UV offsets
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        cols: { value: cols },
        rows: { value: rows },
      },
      vertexShader: `
        attribute float spriteIndex;
        attribute float flipX;
        
        // instanceMatrix is automatically provided by InstancedMesh
        // but we need to declare it if we're using ShaderMaterial without chunks
        // attribute mat4 instanceMatrix; // THREE.js actually injects this for InstancedMesh + ShaderMaterial
        
        uniform float cols;
        uniform float rows;
        
        varying vec2 vUv;
        varying float vFlipX;
        
        void main() {
          vUv = uv;
          vFlipX = flipX;
          
          // Calculate UV offset based on sprite index
          float col = mod(spriteIndex, cols);
          float row = floor(spriteIndex / cols);
          
          // Pass sprite position to fragment shader
          vUv.x = (col + uv.x) / cols;
          vUv.y = 1.0 - ((row + (1.0 - uv.y)) / rows);
          
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        
        varying vec2 vUv;
        varying float vFlipX;
        
        void main() {
          vec2 uv = vUv;
          
          // Apply flip if needed
          if (vFlipX > 0.5) {
            uv.x = 1.0 - uv.x;
          }
          
          vec4 texColor = texture2D(map, uv);
          
          // Alpha test for transparency
          if (texColor.a < 0.05) discard;
          
          gl_FragColor = texColor;
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [texture, cols, rows]);

  // Persistent attributes to avoid re-creating them every frame
  const spriteIndicesAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    [maxInstances]
  );
  const flipXValuesAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    [maxInstances]
  );

  // Initialize attributes on geometry once
  useEffect(() => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    geometry.setAttribute("spriteIndex", spriteIndicesAttr);
    geometry.setAttribute("flipX", flipXValuesAttr);
  }, [spriteIndicesAttr, flipXValuesAttr]);

  // Update instance matrices and custom attributes
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const count = Math.min(instances.length, maxInstances);

    // Update each instance
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const instance = instances[i];
      if (!instance) continue;

      // Set position and scale
      matrix.makeTranslation(
        instance.position[0],
        instance.position[1],
        instance.position[2]
      );
      matrix.scale(new THREE.Vector3(instance.scale, instance.scale, 1));
      mesh.setMatrixAt(i, matrix);

      // Set sprite index and flip
      spriteIndicesAttr.setX(i, instance.spriteIndex);
      flipXValuesAttr.setX(i, instance.flipX ? 1.0 : 0.0);
    }

    // Hide unused instances
    for (let i = count; i < maxInstances; i++) {
      matrix.makeScale(0, 0, 0);
      mesh.setMatrixAt(i, matrix);
    }

    // Update attributes
    mesh.instanceMatrix.needsUpdate = true;
    spriteIndicesAttr.needsUpdate = true;
    flipXValuesAttr.needsUpdate = true;

    // Set render count
    mesh.count = count;
    mesh.frustumCulled = false;
  }, [instances, maxInstances, textureUrl, spriteIndicesAttr, flipXValuesAttr]);

  return {
    meshRef,
    material,
  };
}
