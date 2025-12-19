import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterHandler,
} from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { useGameStore } from "../hooks/useGameStore";
import { sprites } from "../assets/assetPaths";
import type { XpOrbUserData, RigidBodyUserData } from "../types";

interface XpOrbProps {
  id: string;
  position: [number, number, number];
  xpValue: number;
}

const PICKUP_RANGE = 2.5; // Distance at which XP orb starts moving toward player
const ATTRACTION_SPEED = 10; // Speed at which orb moves toward player
const FLOAT_AMPLITUDE = 0.08; // Height of bobbing animation
const FLOAT_FREQUENCY = 2.5; // Speed of bobbing animation

export const XpOrb = ({ id, position, xpValue }: XpOrbProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  // PERFORMANCE: Use selective selectors to avoid unnecessary re-renders
  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const addXp = useGameStore((state) => state.addXp);
  const removeXpOrb = useGameStore((state) => state.removeXpOrb);
  const [isAttracted, setIsAttracted] = useState(false);
  const timeRef = useRef(0);
  const basePositionRef = useRef({ x: position[0], y: position[1] });
  const collectedRef = useRef(false);

  const collectOrb = () => {
    if (collectedRef.current) return;
    collectedRef.current = true;
    addXp(xpValue);
    removeXpOrb(id);
  };

  useFrame((_state, delta) => {
    if (!rigidBody.current || isPaused || !isRunning || collectedRef.current) {
      return;
    }

    timeRef.current += delta;

    const currentPos = rigidBody.current.translation();
    const dx = playerPosition.x - currentPos.x;
    const dy = playerPosition.y - currentPos.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    // Check if player is close enough to collect
    if (distanceToPlayer < 0.3) {
      collectOrb();
      return;
    }

    // Check if player is within attraction range
    if (distanceToPlayer < PICKUP_RANGE) {
      if (!isAttracted) setIsAttracted(true);

      // Smoothly move toward player using kinematic positioning
      const moveSpeed = ATTRACTION_SPEED * delta;
      const normalizedDx = dx / distanceToPlayer;
      const normalizedDy = dy / distanceToPlayer;

      rigidBody.current.setNextKinematicTranslation({
        x: currentPos.x + normalizedDx * moveSpeed,
        y: currentPos.y + normalizedDy * moveSpeed,
        z: 0,
      });
    } else {
      if (isAttracted) setIsAttracted(false);

      // Gentle floating/bobbing animation when stationary
      const floatOffset =
        Math.sin(timeRef.current * FLOAT_FREQUENCY) * FLOAT_AMPLITUDE;

      rigidBody.current.setNextKinematicTranslation({
        x: basePositionRef.current.x,
        y: basePositionRef.current.y + floatOffset,
        z: 0,
      });
    }
  });

  const handleIntersection: IntersectionEnterHandler = (payload) => {
    const userData = payload.other.rigidBodyObject?.userData as
      | RigidBodyUserData
      | undefined;

    if (userData?.type === "player") {
      collectOrb();
    }
  };

  const xpOrbUserData: XpOrbUserData = {
    type: "xpOrb",
    id,
    xpValue,
  };

  return (
    <RigidBody
      ref={rigidBody}
      position={position}
      lockRotations
      type="kinematicPosition"
      userData={xpOrbUserData}
      onIntersectionEnter={handleIntersection}
      gravityScale={0}
    >
      <CuboidCollider args={[0.25, 0.25, 0.25]} sensor />
      <Sprite
        textureUrl={sprites.xp}
        index={0}
        scale={isAttracted ? 0.8 : 0.6}
        spriteFrameSize={36}
      />
    </RigidBody>
  );
};
