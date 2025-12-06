import { useRef, useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterPayload,
  type IntersectionExitPayload,
} from "@react-three/rapier";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGameStore } from "../hooks/useGameStore";
import { Sprite } from "./Sprite";
import * as THREE from "three";
import { useSpriteAnimation } from "../hooks/useSpriteAnimation";
import { CHARACTERS } from "../data/config/characters";
import { isEnemyUserData } from "../utils/userDataGuards";
import {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
  type PlayerUserData,
} from "../types";

const updateCameraPosition = ({
  camera,
  translation,
}: {
  camera: THREE.Camera;
  translation: { x: number; y: number };
}) => {
  camera.position.set(translation.x, translation.y, 10);
};

const haltPlayerAndCamera = ({
  body,
  camera,
}: {
  body: RapierRigidBody;
  camera: THREE.Camera;
}) => {
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  const translation = body.translation();
  updateCameraPosition({ camera, translation });
};

const buildMoveVector = ({
  input,
  moveSpeed,
}: {
  input: { x: number; y: number };
  moveSpeed: number;
}) => {
  const moveDir = new THREE.Vector3(input.x, input.y, 0);
  if (moveDir.length() > 0) {
    moveDir.normalize().multiplyScalar(moveSpeed);
  }
  return moveDir;
};

const updateFacingAndDirection = ({
  input,
  isFacingLeft,
  setFacingLeft,
  setPlayerDirection,
}: {
  input: { x: number; y: number };
  isFacingLeft: boolean;
  setFacingLeft: (val: boolean) => void;
  setPlayerDirection: (dir: { x: number; y: number }) => void;
}) => {
  if (input.x < 0 && !isFacingLeft) setFacingLeft(true);
  if (input.x > 0 && isFacingLeft) setFacingLeft(false);

  setPlayerDirection({
    x: input.x !== 0 ? Math.sign(input.x) : isFacingLeft ? -1 : 1,
    y: input.y !== 0 ? Math.sign(input.y) : 0,
  });
};

const applyContactDamage = ({
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
}) => {
  if (contacts.size === 0) return;
  if (now - lastDamageTime.current < intervalMs) return;

  const totalDamage = Array.from(contacts.values()).reduce(
    (sum, damage) => sum + damage,
    0
  );

  takeDamage(totalDamage);
  lastDamageTime.current = now;
};

export const Player = () => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useKeyboardControls();
  const {
    playerStats,
    setPlayerPosition,
    setPlayerDirection,
    takeDamage,
    selectedCharacterId,
    isRunning,
    isPaused,
  } = useGameStore();
  const [isFacingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const lastDamageTime = useRef(0);
  const activeEnemyContacts = useRef(new Map<string, number>());

  useFrame((state) => {
    if (!rigidBody.current) return;

    if (!isRunning || isPaused) {
      haltPlayerAndCamera({ body: rigidBody.current, camera: state.camera });
      return;
    }

    const input = controls.current;
    const { x, y } = input;

    // 1. Determine State
    const isMovingNow = x !== 0 || y !== 0;
    setIsMoving(isMovingNow);

    // Only change vertical look direction if explicitly pressing up/down
    if (y > 0) setIsLookingUp(true);
    else if (y < 0) setIsLookingUp(false);

    // Normalize movement vector
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

    rigidBody.current.setLinvel({ x: moveDir.x, y: moveDir.y, z: 0 }, true);

    // Update store position
    const translation = rigidBody.current.translation();
    setPlayerPosition({ x: translation.x, y: translation.y });

    // Camera follow
    // Smooth lerp could be added here, but direct set is fine for pixel perfect
    updateCameraPosition({ camera: state.camera, translation });

    // Apply contact damage at intervals while any enemies overlap
    applyContactDamage({
      contacts: activeEnemyContacts.current,
      lastDamageTime,
      takeDamage,
      now: Date.now(),
      intervalMs: 500,
    });
  });

  // Determine Animation Name
  let animState = AnimationType.Idle;
  if (isMoving) {
    animState = isLookingUp ? AnimationType.RunUp : AnimationType.Run;
  } else {
    animState = isLookingUp ? AnimationType.IdleUp : AnimationType.Idle;
  }

  // Get character specific data
  const charData = CHARACTERS[selectedCharacterId];

  // Get Frame from Hook
  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Characters,
    variant: AnimationVariant.Default,
    currentAnimation: animState,
  });

  const handleIntersection = (payload: IntersectionEnterPayload) => {
    const userData = payload.other.rigidBodyObject?.userData;

    if (isEnemyUserData(userData)) {
      activeEnemyContacts.current.set(userData.id, userData.damage);
      // Visual feedback could go here
    }
  };

  const handleIntersectionExit = (payload: IntersectionExitPayload) => {
    const userData = payload.other.rigidBodyObject?.userData;

    if (isEnemyUserData(userData)) {
      activeEnemyContacts.current.delete(userData.id);
    }
  };

  const playerUserData: PlayerUserData = {
    type: "player",
    characterId: selectedCharacterId,
  };

  return (
    <RigidBody
      ref={rigidBody}
      colliders={false}
      lockRotations
      position={[0, 0, 0]}
      type="dynamic"
      friction={0}
      userData={playerUserData}
      onIntersectionEnter={handleIntersection}
      onIntersectionExit={handleIntersectionExit}
    >
      <CuboidCollider args={[0.3, 0.3, 1]} sensor />
      <Sprite
        {...charData.sprite_config}
        index={frameIndex}
        flipX={isFacingLeft}
      />
    </RigidBody>
  );
};
