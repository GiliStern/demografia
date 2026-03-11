import type { RefObject } from "react";
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
