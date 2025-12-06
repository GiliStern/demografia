import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  type IntersectionEnterPayload,
  type IntersectionExitPayload,
} from "@react-three/rapier";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGameStore } from "../hooks/useGameStore";
import { Sprite } from "./Sprite";
import { useSpriteAnimation } from "../hooks/useSpriteAnimation";
import { CHARACTERS } from "../data/config/characters";
import { isEnemyUserData } from "../utils/userDataGuards";
import {
  AnimationCategory,
  AnimationVariant,
  type PlayerUserData,
} from "../types";
import { getAnimationState, updatePlayerFrame } from "../utils/playerControls";

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
    enemiesPositions,
  } = useGameStore();
  const [isFacingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const lastDamageTime = useRef(0);
  const activeEnemyContacts = useRef<Map<string, number>>(new Map());

  useFrame((state) => {
    updatePlayerFrame({
      rigidBody: rigidBody.current,
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
      camera: state.camera,
      activeEnemyContacts: activeEnemyContacts.current,
      lastDamageTime,
      takeDamage,
    });
  });

  const currentAnimation = getAnimationState({
    isMoving,
    isLookingUp,
  });

  const charData = CHARACTERS[selectedCharacterId];

  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Characters,
    variant: AnimationVariant.Default,
    currentAnimation,
  });

  const handleIntersection = useCallback(
    (payload: IntersectionEnterPayload) => {
      const userData = payload.other.rigidBodyObject?.userData;

      if (!isEnemyUserData(userData)) return;
      activeEnemyContacts.current.set(userData.id, userData.damage);
    },
    []
  );

  const handleIntersectionExit = useCallback(
    (payload: IntersectionExitPayload) => {
      const userData = payload.other.rigidBodyObject?.userData;

      if (!isEnemyUserData(userData)) return;
      activeEnemyContacts.current.delete(userData.id);
    },
    []
  );

  useEffect(() => {
    const contacts = activeEnemyContacts.current;
    contacts.forEach((_, id) => {
      if (!enemiesPositions[id]) {
        contacts.delete(id);
      }
    });
  }, [enemiesPositions]);

  const playerUserData = useMemo<PlayerUserData>(
    () => ({
      type: "player",
      characterId: selectedCharacterId,
    }),
    [selectedCharacterId]
  );

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
