import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterPayload,
} from "@react-three/rapier";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGameStore } from "../store/gameStore";
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

export const Player = () => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useKeyboardControls();
  const {
    playerStats,
    setPlayerPosition,
    setPlayerDirection,
    takeDamage,
    selectedCharacterId,
  } = useGameStore();
  const [isFacingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const lastDamageTime = useRef(0);

  useFrame((state) => {
    if (!rigidBody.current) return;

    const { x, y } = controls.current;

    // 1. Determine State
    const isRunning = x !== 0 || y !== 0;
    setIsMoving(isRunning);

    // Only change vertical look direction if explicitly pressing up/down
    if (y > 0) setIsLookingUp(true);
    else if (y < 0) setIsLookingUp(false);

    // Normalize movement vector
    const moveDir = new THREE.Vector3(x, y, 0);
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(playerStats.moveSpeed);
      setPlayerDirection(
        x !== 0 ? Math.sign(x) : isFacingLeft ? -1 : 1,
        y !== 0 ? Math.sign(y) : 0
      );
    }

    rigidBody.current.setLinvel({ x: moveDir.x, y: moveDir.y, z: 0 }, true);

    // Update store position
    const translation = rigidBody.current.translation();
    setPlayerPosition(translation.x, translation.y);

    // Camera follow
    // Smooth lerp could be added here, but direct set is fine for pixel perfect
    state.camera.position.set(translation.x, translation.y, 10);

    // Facing direction
    if (x < 0 && !isFacingLeft) setFacingLeft(true);
    if (x > 0 && isFacingLeft) setFacingLeft(false);
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
    const now = Date.now();
    // Invulnerability frame of 500ms
    if (now - lastDamageTime.current < 500) return;

    const userData = payload.other.rigidBodyObject?.userData;

    if (isEnemyUserData(userData)) {
      takeDamage(userData.damage);
      lastDamageTime.current = now;
      // Visual feedback needed here
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
    >
      <CuboidCollider args={[0.3, 0.3, 1]} />
      <Sprite
        {...charData.sprite_config}
        index={frameIndex}
        flipX={isFacingLeft}
      />
    </RigidBody>
  );
};
