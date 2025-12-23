import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  RapierRigidBody,
  IntersectionEnterHandler,
} from "@react-three/rapier";
import { useGameStore } from "@/store/gameStore";
import type { RigidBodyUserData, XpOrbUserData } from "@/types";
import type {
  UseXpOrbBehaviorParams,
  UseXpOrbBehaviorReturn,
} from "@/types/hooks/entities";

const PICKUP_RANGE = 2.5; // Distance at which XP orb starts moving toward player
const ATTRACTION_SPEED = 10; // Speed at which orb moves toward player
const FLOAT_AMPLITUDE = 0.08; // Height of bobbing animation
const FLOAT_FREQUENCY = 2.5; // Speed of bobbing animation

/**
 * Custom hook for XP orb behavior - handles attraction, collection, and floating animation
 */
export function useXpOrbBehavior({
  id,
  position,
  xpValue,
}: UseXpOrbBehaviorParams): UseXpOrbBehaviorReturn {
  const rigidBody = useRef<RapierRigidBody>(null);

  // Zustand selectors - selective to prevent unnecessary re-renders
  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const addXp = useGameStore((state) => state.addXp);
  const removeXpOrb = useGameStore((state) => state.removeXpOrb);

  // Local state and refs
  const [isAttracted, setIsAttracted] = useState(false);
  const timeRef = useRef(0);
  const basePositionRef = useRef({ x: position[0], y: position[1] });
  const collectedRef = useRef(false);

  // Collect the orb and award XP
  const collectOrb = useCallback(() => {
    if (collectedRef.current) return;
    collectedRef.current = true;
    addXp(xpValue);
    removeXpOrb(id);
  }, [addXp, xpValue, removeXpOrb, id]);

  // Handle orb movement - attraction to player or floating animation
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

  // Collision handler - collect on player contact
  const handleIntersection: IntersectionEnterHandler = useCallback(
    (payload) => {
      const userData = payload.other.rigidBodyObject?.userData as
        | RigidBodyUserData
        | undefined;

      if (userData?.type === "player") {
        collectOrb();
      }
    },
    [collectOrb]
  );

  // User data for collision detection
  const xpOrbUserData: XpOrbUserData = useMemo(
    () => ({
      type: "xpOrb",
      id,
      xpValue,
    }),
    [id, xpValue]
  );

  return {
    rigidBody,
    isAttracted,
    xpOrbUserData,
    handleIntersection,
  };
}
