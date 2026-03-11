import { useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import type { SpriteConfig } from "@/types";
import { type OrbitingOrb } from "@/hooks/weapons/useOrbitWeapon";
import { Sprite } from "../Sprite";
import { usePauseAwareFrame } from "@/hooks/game/usePauseAwareFrame";
import { getSpinningSpriteIndex } from "@/utils/entities/enemyAnimation";

export interface OrbitingBodyProps {
  orb: OrbitingOrb;
  radius: number;
  baseAngle: MutableRefObject<number>;
  playerPosition: { x: number; y: number };
  damage: number;
  spriteConfig: SpriteConfig;
  shouldSpin?: boolean;
}

const computeOrbitPosition = (
  orb: OrbitingOrb,
  baseAngle: number,
  radius: number,
  playerPosition: { x: number; y: number }
) => {
  // Angle = per-orb offset plus shared base angle so all orbiters rotate together.
  const angle = orb.angleOffset + baseAngle;
  // Convert polar coordinates (angle, radius) around the player into world x/y.
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
  shouldSpin,
}: OrbitingBodyProps) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const positionRef = useRef<[number, number, number]>([0, 0, 0]);
  const [spriteIndex, setSpriteIndex] = useState(spriteConfig.index);
  const lastFrameRef = useRef(spriteConfig.index);

  const shouldAnimate =
    shouldSpin && (spriteConfig.spriteFrameCount ?? 0) >= 2;

  useFrame((state) => {
    if (shouldAnimate) {
      const currentTime = state.clock.getElapsedTime();
      const frame = getSpinningSpriteIndex(currentTime);
      if (frame !== lastFrameRef.current) {
        lastFrameRef.current = frame;
        setSpriteIndex(frame);
      }
    }
  });

  usePauseAwareFrame(() => {
    // keep the kinematic body awake so orbiting continues while idle
    bodyRef.current?.wakeUp();
    const { x, y } = computeOrbitPosition(
      orb,
      baseAngle.current,
      radius,
      playerPosition
    );
    positionRef.current = [x, y, 0];
    bodyRef.current?.setNextKinematicTranslation({ x, y, z: 0 });
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      lockRotations
      sensor
      gravityScale={0}
      canSleep={false}
      userData={{ type: "projectile", id: orb.id, damage, owner: "player" }}
      position={positionRef.current}
    >
      <CuboidCollider args={[0.35, 0.35, 0.35]} />
      <Sprite
        textureUrl={spriteConfig.textureUrl}
        index={shouldAnimate ? spriteIndex : spriteConfig.index}
        scale={spriteConfig.scale}
        {...(spriteConfig.spriteFrameSize
          ? { spriteFrameSize: spriteConfig.spriteFrameSize }
          : {})}
      />
    </RigidBody>
  );
};
