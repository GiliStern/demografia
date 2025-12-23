import type { MutableRefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";

interface Velocity2D {
  x: number;
  y: number;
}

interface InitialProjectileParams {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  velocityRef: MutableRefObject<Velocity2D>;
  timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  durationSeconds: number;
  onDespawn: () => void;
}

export const applyInitialProjectileState = ({
  rigidBodyRef,
  velocityRef,
  timeoutRef,
  durationSeconds,
  onDespawn,
}: InitialProjectileParams): (() => void) => {
  if (rigidBodyRef.current) {
    rigidBodyRef.current.setLinvel(
      { x: velocityRef.current.x, y: velocityRef.current.y, z: 0 },
      true
    );
  }

  timeoutRef.current = setTimeout(onDespawn, durationSeconds * 1000);

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
};

interface SyncVelocityParams {
  rigidBodyRef: MutableRefObject<RapierRigidBody | null>;
  velocityRef: MutableRefObject<Velocity2D>;
  isRunning: boolean;
  isPaused: boolean;
}

export const syncProjectileVelocity = ({
  rigidBodyRef,
  velocityRef,
  isRunning,
  isPaused,
}: SyncVelocityParams): void => {
  if (!rigidBodyRef.current) return;

  if (!isRunning || isPaused) {
    rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    return;
  }

  rigidBodyRef.current.setLinvel(
    { x: velocityRef.current.x, y: velocityRef.current.y, z: 0 },
    true
  );
};
