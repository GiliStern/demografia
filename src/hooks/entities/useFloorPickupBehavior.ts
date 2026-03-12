import { useRef, useCallback } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { usePlayerStore } from "@/store/playerStore";
import { useSessionStore } from "@/store/sessionStore";
import { useFloorPickupsStore } from "@/store/gameStore";
import type { FloorPickupId } from "@/types";

const PICKUP_RANGE = 2.5; // Distance at which pickup starts moving toward player
const MAGNET_PULSE_RANGE = 9999; // Range when Magnet floor pickup is active
const ATTRACTION_SPEED = 10; // Speed at which pickup moves toward player
const COLLECT_DISTANCE = 0.3; // Distance at which pickup is collected

export interface UseFloorPickupBehaviorParams {
  id: string;
  position: { x: number; y: number };
  pickupId: FloorPickupId;
  payload?: { goldAmount?: number };
}

export interface UseFloorPickupBehaviorReturn {
  rigidBody: React.RefObject<RapierRigidBody | null>;
}

/**
 * Floor pickup behavior - attraction to player (same as XP orbs), collect when in range.
 */
export function useFloorPickupBehavior({
  id,
  position,
  pickupId,
  payload,
}: UseFloorPickupBehaviorParams): UseFloorPickupBehaviorReturn {
  const rigidBody = useRef<RapierRigidBody>(null);
  const collectedRef = useRef(false);
  const basePositionRef = useRef({ x: position.x, y: position.y });

  const playerPosition = usePlayerStore((state) => state.playerPosition);
  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);
  const runTimer = useSessionStore((state) => state.runTimer);
  const magnetPulseEndTime = useSessionStore(
    (state) => state.magnetPulseEndTime,
  );
  const collectPickup = useSessionStore((state) => state.collectPickup);
  const removeFloorPickup = useFloorPickupsStore(
    (state) => state.removeFloorPickup,
  );

  const collect = useCallback(() => {
    if (collectedRef.current) return;
    collectedRef.current = true;
    collectPickup(pickupId, payload);
    removeFloorPickup(id);
  }, [id, pickupId, payload, collectPickup, removeFloorPickup]);

  useFrame((_state, delta) => {
    if (!rigidBody.current || isPaused || !isRunning || collectedRef.current) {
      return;
    }

    const currentPos = rigidBody.current.translation();
    const dx = playerPosition.x - currentPos.x;
    const dy = playerPosition.y - currentPos.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    if (distanceToPlayer < COLLECT_DISTANCE) {
      collect();
      return;
    }

    const attractionRange =
      runTimer < magnetPulseEndTime ? MAGNET_PULSE_RANGE : PICKUP_RANGE;

    if (distanceToPlayer < attractionRange) {
      const moveSpeed = ATTRACTION_SPEED * delta;
      const normalizedDx = dx / distanceToPlayer;
      const normalizedDy = dy / distanceToPlayer;

      rigidBody.current.setNextKinematicTranslation({
        x: currentPos.x + normalizedDx * moveSpeed,
        y: currentPos.y + normalizedDy * moveSpeed,
        z: 0,
      });
    } else {
      rigidBody.current.setNextKinematicTranslation({
        x: basePositionRef.current.x,
        y: basePositionRef.current.y,
        z: 0,
      });
    }
  });

  return { rigidBody };
}
