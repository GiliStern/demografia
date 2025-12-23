import type { MutableRefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { AnimationType } from "../../types";

interface MoveInput {
  x: number;
  y: number;
}

export const updateCameraPosition = ({
  camera,
  translation,
}: {
  camera: THREE.Camera;
  translation: { x: number; y: number };
}): void => {
  camera.position.set(translation.x, translation.y, 10);
};

export const haltPlayerAndCamera = ({
  body,
  camera,
}: {
  body: RapierRigidBody;
  camera: THREE.Camera;
}): void => {
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  const translation = body.translation();
  updateCameraPosition({ camera, translation });
};

export const buildMoveVector = ({
  input,
  moveSpeed,
}: {
  input: MoveInput;
  moveSpeed: number;
}): THREE.Vector3 => {
  const moveDir = new THREE.Vector3(input.x, input.y, 0);
  if (moveDir.length() > 0) {
    moveDir.normalize().multiplyScalar(moveSpeed);
  }
  return moveDir;
};

export const updateFacingAndDirection = ({
  input,
  isFacingLeft,
  setFacingLeft,
  setPlayerDirection,
}: {
  input: MoveInput;
  isFacingLeft: boolean;
  setFacingLeft: (val: boolean) => void;
  setPlayerDirection: (dir: MoveInput) => void;
}): void => {
  if (input.x < 0 && !isFacingLeft) {
    setFacingLeft(true);
  }
  if (input.x > 0 && isFacingLeft) {
    setFacingLeft(false);
  }

  setPlayerDirection({
    x: input.x !== 0 ? Math.sign(input.x) : isFacingLeft ? -1 : 1,
    y: input.y !== 0 ? Math.sign(input.y) : 0,
  });
};

export const applyContactDamage = ({
  contacts,
  lastDamageTime,
  takeDamage,
  now,
  intervalMs,
}: {
  contacts: Map<string, number>;
  lastDamageTime: MutableRefObject<number>;
  takeDamage: (amount: number) => number | void;
  now: number;
  intervalMs: number;
}): void => {
  if (contacts.size === 0) return;
  if (now - lastDamageTime.current < intervalMs) return;

  const totalDamage = Array.from(contacts.values()).reduce(
    (sum, damage) => sum + damage,
    0
  );

  takeDamage(totalDamage);
  lastDamageTime.current = now;
};

export const getAnimationState = ({
  isMoving,
  isLookingUp,
}: {
  isMoving: boolean;
  isLookingUp: boolean;
}): AnimationType => {
  if (isMoving) {
    return isLookingUp ? AnimationType.RunUp : AnimationType.Run;
  }
  return isLookingUp ? AnimationType.IdleUp : AnimationType.Idle;
};

interface PlayerFrameParams {
  rigidBody: RapierRigidBody | null;
  controls: MutableRefObject<MoveInput>;
  isRunning: boolean;
  isPaused: boolean;
  playerStats: { moveSpeed: number };
  isFacingLeft: boolean;
  setFacingLeft: (value: boolean) => void;
  setIsMoving: (value: boolean) => void;
  setIsLookingUp: (value: boolean) => void;
  setPlayerDirection: (dir: MoveInput) => void;
  setPlayerPosition: (pos: { x: number; y: number }) => void;
  camera: THREE.Camera;
  activeEnemyContacts: Map<string, number>;
  lastDamageTime: MutableRefObject<number>;
  takeDamage: (amount: number) => number | void;
}

export const updatePlayerFrame = ({
  rigidBody,
  controls,
  isRunning,
  isPaused,
  playerStats,
  isFacingLeft,
  setFacingLeft,
  setIsMoving,
  setIsLookingUp,
  setPlayerDirection,
  setPlayerPosition,
  camera,
  activeEnemyContacts,
  lastDamageTime,
  takeDamage,
}: PlayerFrameParams): void => {
  if (!rigidBody) return;
  if (!isRunning || isPaused) {
    haltPlayerAndCamera({ body: rigidBody, camera });
    return;
  }

  const input = controls.current;
  const { x, y } = input;

  const isMovingNow = x !== 0 || y !== 0;
  setIsMoving(isMovingNow);

  if (y > 0) {
    setIsLookingUp(true);
  } else if (y < 0) {
    setIsLookingUp(false);
  }

  const moveDir = buildMoveVector({
    input,
    moveSpeed: playerStats.moveSpeed,
  });
  if (isMovingNow) {
    updateFacingAndDirection({
      input,
      isFacingLeft,
      setFacingLeft,
      setPlayerDirection,
    });
  }

  rigidBody.setLinvel({ x: moveDir.x, y: moveDir.y, z: 0 }, true);

  const translation = rigidBody.translation();
  setPlayerPosition({ x: translation.x, y: translation.y });

  updateCameraPosition({ camera, translation });

  applyContactDamage({
    contacts: activeEnemyContacts,
    lastDamageTime,
    takeDamage,
    now: Date.now(),
    intervalMs: 500,
  });
};
