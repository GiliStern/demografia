import { useCallback, useEffect, useRef } from "react";
import type {
  RapierRigidBody,
  IntersectionEnterPayload,
} from "@react-three/rapier";
import { useSpriteAnimation } from "@/hooks/rendering/useSpriteAnimation";
import {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
  type RigidBodyUserData,
} from "@/types";
import type {
  ProjectileBehaviorParams,
  ProjectileBehaviorResult,
} from "@/types/hooks/entities";
import { applyInitialProjectileState } from "@/utils/weapons/projectileControls";

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
