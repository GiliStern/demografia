import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import type {
  IntersectionEnterPayload,
  RapierRigidBody,
} from "@react-three/rapier";
import { useGameStore } from "@/hooks/useGameStore";
import { useSpriteAnimation } from "@/hooks/useSpriteAnimation";
import {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
  type ProjectileUserData,
  type RigidBodyUserData,
} from "@/types";
import {
  applyInitialProjectileState,
  syncProjectileVelocity,
} from "@/utils/projectileControls";

interface ProjectileBehaviorParams {
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

export const useProjectileBehavior = ({
  id,
  velocity,
  duration,
  damage,
  onDespawn,
}: ProjectileBehaviorParams): ProjectileBehaviorResult => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const velocityRef = useRef(velocity);
  const { isPaused, isRunning } = useGameStore();

  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Weapons,
    variant: AnimationVariant.Default,
    currentAnimation: AnimationType.Idle,
  });

  useEffect(() => {
    return applyInitialProjectileState({
      rigidBodyRef,
      velocityRef,
      timeoutRef,
      durationSeconds: duration,
      onDespawn,
    });
  }, [duration, onDespawn]);

  useEffect(() => {
    syncProjectileVelocity({
      rigidBodyRef,
      velocityRef,
      isRunning,
      isPaused,
    });
  }, [isPaused, isRunning]);

  const handleIntersection = useCallback(
    (payload: IntersectionEnterPayload) => {
      const userData = payload.other.rigidBodyObject?.userData as
        | RigidBodyUserData
        | undefined;

      if (userData?.type !== "enemy") return;
      onDespawn();
    },
    [onDespawn]
  );

  return {
    rigidBodyRef,
    frameIndex,
    handleIntersection,
    projectileUserData: {
      type: "projectile",
      id,
      damage,
      owner: "player",
    },
  };
};
