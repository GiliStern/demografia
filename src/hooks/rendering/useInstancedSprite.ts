import { useRef, useEffect, useMemo, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type {
  UseInstancedSpriteParams,
  UseInstancedSpriteReturn,
  InstanceData,
} from "@/types/hooks/rendering";

// Re-export for convenience
export type { InstanceData };

function updateMeshFromInstances(
  mesh: THREE.InstancedMesh,
  instances: InstanceData[],
  maxInstances: number,
  spriteIndicesAttr: THREE.InstancedBufferAttribute,
  flipXValuesAttr: THREE.InstancedBufferAttribute,
  flashValuesAttr: THREE.InstancedBufferAttribute,
): void {
  const count = Math.min(instances.length, maxInstances);
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < count; i++) {
    const instance = instances[i];
    if (!instance) continue;

    matrix.makeTranslation(
      instance.position[0],
      instance.position[1],
      instance.position[2],
    );
    matrix.scale(new THREE.Vector3(instance.scale, instance.scale, 1));
    mesh.setMatrixAt(i, matrix);

    spriteIndicesAttr.setX(i, instance.spriteIndex);
    flipXValuesAttr.setX(i, instance.flipX ? 1.0 : 0.0);
    flashValuesAttr.setX(i, instance.flash ?? 0);
  }

  for (let i = count; i < maxInstances; i++) {
    matrix.makeScale(0, 0, 0);
    mesh.setMatrixAt(i, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  spriteIndicesAttr.needsUpdate = true;
  flipXValuesAttr.needsUpdate = true;
  flashValuesAttr.needsUpdate = true;
  mesh.count = count;
  mesh.frustumCulled = false;
}

/**
 * Custom hook for GPU-instanced sprite rendering with per-instance sprite animation.
 * When instancesRef is provided, updates the mesh in useFrame (no React rerenders).
 * When instances is provided, updates via useEffect (triggers rerenders when instances change).
 */
export function useInstancedSprite({
  textureUrl,
  spriteFrameSize,
  instances,
  instancesRef,
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
  }, [texture, spriteFrameSize]);

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
        attribute float flash;
        
        // instanceMatrix is automatically provided by InstancedMesh
        // but we need to declare it if we're using ShaderMaterial without chunks
        // attribute mat4 instanceMatrix; // THREE.js actually injects this for InstancedMesh + ShaderMaterial
        
        uniform float cols;
        uniform float rows;
        
        varying vec2 vUv;
        varying float vFlipX;
        varying float vFlash;
        
        void main() {
          vUv = uv;
          vFlipX = flipX;
          vFlash = flash;
          
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
        varying float vFlash;
        
        void main() {
          vec2 uv = vUv;
          
          // Apply flip if needed
          if (vFlipX > 0.5) {
            uv.x = 1.0 - uv.x;
          }
          
          vec4 texColor = texture2D(map, uv);
          
          // Alpha test for transparency
          if (texColor.a < 0.05) discard;
          
          // Blend toward white for hit flash
          vec3 white = vec3(1.0);
          texColor.rgb = mix(texColor.rgb, white, clamp(vFlash, 0.0, 1.0));
          
          gl_FragColor = texColor;
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [texture, cols, rows]);

  // Persistent attributes to avoid re-creating them every frame
  const spriteIndicesAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    [maxInstances],
  );
  const flipXValuesAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    [maxInstances],
  );
  const flashValuesAttr = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    [maxInstances],
  );

  // Initialize attributes on geometry once
  useEffect(() => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    geometry.setAttribute("spriteIndex", spriteIndicesAttr);
    geometry.setAttribute("flipX", flipXValuesAttr);
    geometry.setAttribute("flash", flashValuesAttr);
  }, [spriteIndicesAttr, flipXValuesAttr, flashValuesAttr]);

  const syncMeshNow = useCallback(() => {
    if (!instancesRef || !meshRef.current) return;
    const inst = instancesRef.current;
    if (!inst) return;
    updateMeshFromInstances(
      meshRef.current,
      inst,
      maxInstances,
      spriteIndicesAttr,
      flipXValuesAttr,
      flashValuesAttr,
    );
  }, [
    instancesRef,
    maxInstances,
    spriteIndicesAttr,
    flipXValuesAttr,
    flashValuesAttr,
  ]);

  // When instancesRef: update mesh in useFrame (no React rerenders)
  useFrame(() => {
    syncMeshNow();
  });

  // When instances (no instancesRef): update mesh in useEffect
  useEffect(() => {
    if (instancesRef || !instances || !meshRef.current) return;
    updateMeshFromInstances(
      meshRef.current,
      instances,
      maxInstances,
      spriteIndicesAttr,
      flipXValuesAttr,
      flashValuesAttr,
    );
  }, [
    instancesRef,
    instances,
    maxInstances,
    textureUrl,
    spriteIndicesAttr,
    flipXValuesAttr,
    flashValuesAttr,
  ]);

  return {
    meshRef,
    material,
    syncMeshNow,
  };
}
