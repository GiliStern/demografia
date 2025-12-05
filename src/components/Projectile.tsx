import { useRef, useEffect } from "react";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import { Sprite } from "./Sprite";

interface ProjectileProps {
  position: [number, number, number];
  velocity: [number, number];
  duration: number;
  damage: number;
  spriteConfig: {
    textureName?: string;
    textureUrl?: string;
    index: number;
    scale?: number;
    spriteFrameSize?: number;
  };
  onDespawn: () => void;
}

export const Projectile = ({
  position,
  velocity,
  duration,
  damage,
  spriteConfig,
  onDespawn,
}: ProjectileProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    // Set initial velocity
    if (rigidBody.current) {
      rigidBody.current.setLinvel(
        { x: velocity[0], y: velocity[1], z: 0 },
        true
      );
    }

    // Despawn timer
    timeoutRef.current = setTimeout(
      onDespawn,
      duration * 1000
    ) as unknown as number;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleIntersection = (payload: any) => {
    // In a real system we'd check tags/layers, but for now assume sensor triggers on enemies
    if (
      payload.other.rigidBodyObject?.userData &&
      (payload.other.rigidBodyObject.userData as any).type === "enemy"
    ) {
      // We could apply damage here or callback
      // For now just despawn on impact if not piercing
      onDespawn();
    }
  };

  return (
    <RigidBody
      ref={rigidBody}
      position={position}
      sensor
      gravityScale={0}
      lockRotations
      type="kinematicVelocity"
      userData={{ type: "projectile", damage }}
      onIntersectionEnter={handleIntersection}
    >
      <CuboidCollider args={[0.2, 0.2, 0.2]} />
      <Sprite
        textureName={spriteConfig.textureName}
        textureUrl={spriteConfig.textureUrl}
        index={spriteConfig.index}
        scale={spriteConfig.scale || 0.5}
        spriteFrameSize={spriteConfig.spriteFrameSize || 32}
      />
    </RigidBody>
  );
};
