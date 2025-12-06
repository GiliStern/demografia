import { useRef, useEffect } from "react";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterPayload,
} from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { useGameStore } from "../hooks/useGameStore";
import type {
  ProjectileProps,
  ProjectileUserData,
  RigidBodyUserData,
} from "@/types";
import { AnimationCategory, AnimationType, AnimationVariant } from "@/types";
import { useSpriteAnimation } from "@/hooks/useSpriteAnimation";

export const Projectile = ({
  id,
  position,
  velocity,
  duration,
  damage,
  spriteConfig,
  shouldSpin,
  onDespawn,
}: ProjectileProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { isPaused, isRunning } = useGameStore();
  const velocityRef = useRef(velocity);

  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Weapons,
    variant: AnimationVariant.Default,
    currentAnimation: AnimationType.Idle,
  });

  useEffect(() => {
    // Set initial velocity
    if (rigidBody.current) {
      rigidBody.current.setLinvel(
        { x: velocityRef.current.x, y: velocityRef.current.y, z: 0 },
        true
      );
    }

    // Despawn timer
    timeoutRef.current = setTimeout(onDespawn, duration * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!rigidBody.current) return;

    if (!isRunning || isPaused) {
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    } else {
      rigidBody.current.setLinvel(
        { x: velocityRef.current.x, y: velocityRef.current.y, z: 0 },
        true
      );
    }
  }, [isPaused, isRunning]);

  const handleIntersection = (payload: IntersectionEnterPayload) => {
    // In a real system we'd check tags/layers, but for now assume sensor triggers on enemies
    const userData = payload.other.rigidBodyObject?.userData as
      | RigidBodyUserData
      | undefined;

    if (userData?.type === "enemy") {
      // We could apply damage here or callback
      // For now just despawn on impact if not piercing
      onDespawn();
    }
  };

  const projectileUserData: ProjectileUserData = {
    type: "projectile",
    id,
    damage,
    owner: "player",
  };

  return (
    <RigidBody
      ref={rigidBody}
      position={[position.x, position.y, position.z]}
      sensor
      gravityScale={0}
      lockRotations
      type="kinematicVelocity"
      userData={projectileUserData}
      onIntersectionEnter={handleIntersection}
    >
      <CuboidCollider args={[0.2, 0.2, 0.2]} />
      <Sprite
        textureUrl={spriteConfig.textureUrl}
        index={shouldSpin ? frameIndex : spriteConfig.index}
        scale={spriteConfig.scale}
        spriteFrameSize={spriteConfig.spriteFrameSize ?? 32}
      />
    </RigidBody>
  );
};
