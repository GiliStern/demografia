import type { MutableRefObject, RefObject } from "react";
import type * as THREE from "three";
import type {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
} from "../../types";

// ===========================
// Instanced Sprite Hook Types
// ===========================

export interface InstanceData {
  position: [number, number, number];
  scale: number;
  spriteIndex: number;
  flipX?: boolean | undefined;
  /** 0-1 flash intensity for hit feedback; blend toward white when > 0 */
  flash?: number;
}

export interface UseInstancedSpriteParams {
  textureUrl: string;
  spriteFrameSize: number;
  instances?: InstanceData[];
  instancesRef?: MutableRefObject<InstanceData[] | undefined>;
  maxInstances: number;
}

export interface UseInstancedSpriteReturn {
  meshRef: RefObject<THREE.InstancedMesh>;
  material: THREE.ShaderMaterial;
  /** Call after updating instancesRef.current to sync the instanced mesh in the same frame. */
  syncMeshNow: () => void;
}

// ===========================
// Sprite Animation Hook Types
// ===========================

export interface UseSpriteAnimationProps {
  category: AnimationCategory;
  variant: AnimationVariant;
  currentAnimation: AnimationType;
}
