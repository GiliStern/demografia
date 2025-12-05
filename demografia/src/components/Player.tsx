import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGameStore } from "../store/gameStore";
import { Sprite } from "./Sprite";
import * as THREE from "three";
import { useSpriteAnimation } from "../hooks/useSpriteAnimation";
import { CHARACTERS } from "../data/config/characters";

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
  let animState = "idle";
  if (isMoving) {
    animState = isLookingUp ? "run_up" : "run";
  } else {
    animState = isLookingUp ? "idle_up" : "idle";
  }

  // Get character specific data
  const charData = CHARACTERS.find((c) => c.id === selectedCharacterId);

  // Get Frame from Hook
  const frameIndex = useSpriteAnimation(
    "characters",
    "default",
    animState as any
  );

  const handleIntersection = (payload: any) => {
    const now = Date.now();
    // Invulnerability frame of 500ms
    if (now - lastDamageTime.current < 500) return;

    if (payload.other.rigidBodyObject?.userData) {
      const userData = payload.other.rigidBodyObject.userData as any;
      if (userData.type === "enemy") {
        takeDamage(10); // Base damage from enemy
        lastDamageTime.current = now;
        // Visual feedback needed here
      }
    }
  };

  return (
    <RigidBody
      ref={rigidBody}
      colliders={false}
      lockRotations
      position={[0, 0, 0]}
      type="dynamic"
      friction={0}
      userData={{ type: "player" }}
      onIntersectionEnter={handleIntersection}
    >
      <CuboidCollider args={[0.3, 0.3, 1]} />
      <Sprite
        textureUrl={charData?.sprite_config.textureUrl}
        textureName="characters"
        index={frameIndex}
        flipX={isFacingLeft}
        spriteFrameSize={charData?.sprite_config.spriteFrameSize || 32}
        scale={charData?.sprite_config.scale || 1}
      />
    </RigidBody>
  );
};
