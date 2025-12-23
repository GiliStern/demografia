import type { RefObject, MutableRefObject } from "react";
import type {
  RapierRigidBody,
  IntersectionEnterHandler,
  IntersectionEnterPayload,
  IntersectionExitPayload,
} from "@react-three/rapier";
import type {
  EnemyId,
  EnemyUserData,
  PlayerUserData,
  ProjectileUserData,
  XpOrbUserData,
} from "../../types";

// ===========================
// Enemy Behavior Hook Types
// ===========================

export interface UseEnemyBehaviorParams {
  id: string;
  typeId: EnemyId;
  position: [number, number, number];
  onDeath: () => void;
}

export interface UseEnemyBehaviorReturn {
  rigidBody: RefObject<RapierRigidBody>;
  isFacingLeft: boolean;
  frameIndex: number;
  enemyUserData: EnemyUserData;
  handleIntersection: IntersectionEnterHandler;
}

// ===========================
// Player Behavior Hook Types
// ===========================

export interface UsePlayerBehaviorReturn {
  rigidBody: RefObject<RapierRigidBody>;
  isFacingLeft: boolean;
  frameIndex: number;
  playerUserData: PlayerUserData;
  handleIntersection: (payload: IntersectionEnterPayload) => void;
  handleIntersectionExit: (payload: IntersectionExitPayload) => void;
}

// ===========================
// Projectile Behavior Hook Types
// ===========================

export interface ProjectileBehaviorParams {
  id: string;
  velocity: { x: number; y: number };
  duration: number;
  damage: number;
  onDespawn: () => void;
}

export interface ProjectileBehaviorResult {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  frameIndex: number;
  handleIntersection: (payload: IntersectionEnterPayload) => void;
  projectileUserData: ProjectileUserData;
}

// ===========================
// XP Orb Behavior Hook Types
// ===========================

export interface UseXpOrbBehaviorParams {
  id: string;
  position: [number, number, number];
  xpValue: number;
}

export interface UseXpOrbBehaviorReturn {
  rigidBody: RefObject<RapierRigidBody>;
  isAttracted: boolean;
  xpOrbUserData: XpOrbUserData;
  handleIntersection: IntersectionEnterHandler;
}
