import type { RefObject } from "react";
import type * as THREE from "three";
import type { AnimationCategory, AnimationType, AnimationVariant } from "../../types";

// ===========================
// Instanced Sprite Hook Types
// ===========================

export interface InstanceData {
  position: [number, number, number];
  scale: number;
  spriteIndex: number;
  flipX?: boolean | undefined;
}

export interface UseInstancedSpriteParams {
  textureUrl: string;
  spriteFrameSize: number;
  instances: InstanceData[];
  maxInstances: number;
}

export interface UseInstancedSpriteReturn {
  meshRef: RefObject<THREE.InstancedMesh>;
  material: THREE.ShaderMaterial;
}

// ===========================
// Sprite Animation Hook Types
// ===========================

export interface UseSpriteAnimationProps {
  category: AnimationCategory;
  variant: AnimationVariant;
  currentAnimation: AnimationType;
}

