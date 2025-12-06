import { useRef, useEffect } from "react";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterPayload,
} from "@react-three/rapier";
import { Sprite } from "./Sprite";
import type {
  ProjectileProps,
  ProjectileUserData,
  RigidBodyUserData,
} from "@/types";

export const Projectile = ({
  id,
  position,
  velocity,
  duration,
  damage,
  spriteConfig,
  onDespawn,
}: ProjectileProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Set initial velocity
    if (rigidBody.current) {
      rigidBody.current.setLinvel({ x: velocity.x, y: velocity.y, z: 0 }, true);
    }

    // Despawn timer
    timeoutRef.current = setTimeout(onDespawn, duration * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
        index={spriteConfig.index}
        scale={spriteConfig.scale}
        spriteFrameSize={spriteConfig.spriteFrameSize ?? 32}
      />
    </RigidBody>
  );
};
