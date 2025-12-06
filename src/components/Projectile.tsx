import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Sprite } from "./Sprite";
import type { ProjectileProps } from "@/types";
import { useProjectileBehavior } from "@/hooks/useProjectileBehavior";

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
  const { rigidBodyRef, frameIndex, handleIntersection, projectileUserData } =
    useProjectileBehavior({ id, velocity, duration, damage, onDespawn });

  return (
    <RigidBody
      ref={rigidBodyRef}
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
