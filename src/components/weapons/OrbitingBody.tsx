import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import type { SpriteConfig } from "@/types";
import { type OrbitingOrb } from "@/hooks/useOrbitWeapon";
import { Sprite } from "../Sprite";

export interface OrbitingBodyProps {
  orb: OrbitingOrb;
  radius: number;
  baseAngle: MutableRefObject<number>;
  playerPosition: { x: number; y: number };
  damage: number;
  spriteConfig: SpriteConfig;
}

const computeOrbitPosition = (
  orb: OrbitingOrb,
  baseAngle: number,
  radius: number,
  playerPosition: { x: number; y: number }
) => {
  const angle = orb.angleOffset + baseAngle;
  return {
    x: playerPosition.x + Math.cos(angle) * radius,
    y: playerPosition.y + Math.sin(angle) * radius,
  };
};

export const OrbitingBody = ({
  orb,
  radius,
  baseAngle,
  playerPosition,
  damage,
  spriteConfig,
}: OrbitingBodyProps) => {
  const bodyRef = useRef<RapierRigidBody>(null);

  useFrame(() => {
    const { x, y } = computeOrbitPosition(
      orb,
      baseAngle.current,
      radius,
      playerPosition
    );
    bodyRef.current?.setNextKinematicTranslation({ x, y, z: 0 });
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      lockRotations
      sensor
      gravityScale={0}
      userData={{ type: "projectile", id: orb.id, damage, owner: "player" }}
      position={[
        playerPosition.x + Math.cos(orb.angleOffset) * radius,
        playerPosition.y + Math.sin(orb.angleOffset) * radius,
        0,
      ]}
    >
      <CuboidCollider args={[0.35, 0.35, 0.35]} />
      <Sprite
        textureUrl={spriteConfig.textureUrl}
        index={spriteConfig.index}
        scale={spriteConfig.scale}
        {...(spriteConfig.spriteFrameSize
          ? { spriteFrameSize: spriteConfig.spriteFrameSize }
          : {})}
      />
    </RigidBody>
  );
};
