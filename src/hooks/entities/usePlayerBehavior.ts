import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  RapierRigidBody,
  IntersectionEnterPayload,
  IntersectionExitPayload,
} from "@react-three/rapier";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import { getEnemyManager } from "@/simulation/enemyManager";
import { useSessionStore } from "@/store/sessionStore";
import { useMovementInput } from "../controls/useMovementInput";
import { useSpriteAnimation } from "../rendering/useSpriteAnimation";
import { isEnemyUserData } from "@/utils/validation/userDataGuards";
import {
  getAnimationState,
  updatePlayerFrame,
} from "@/utils/player/playerControls";
import { getViewportBounds } from "@/utils/rendering/viewportBounds";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";
import {
  AnimationCategory,
  AnimationVariant,
  type PlayerUserData,
} from "@/types";
import type { UsePlayerBehaviorReturn } from "@/types/hooks/entities";

/**
 * Custom hook for player behavior - handles movement, collision, damage, and animation
 */
export function usePlayerBehavior(): UsePlayerBehaviorReturn {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useMovementInput();

  // Zustand selectors - only subscribe to values that affect render
  const selectedCharacterId = useSessionStore(
    (state) => state.selectedCharacterId,
  );
  const isRunning = useSessionStore((state) => state.isRunning);
  const isPaused = useSessionStore((state) => state.isPaused);

  // Local state
  const [isFacingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Refs for damage tracking
  const lastDamageTime = useRef(0);
  const activeEnemyContacts = useRef<Map<string, number>>(new Map());

  // Movement and viewport update
  useFrame((state) => {
    const playerStore = usePlayerStore.getState();
    const gameStore = useGameStore.getState();
    const effectivePlayerStats = playerStore.getEffectivePlayerStats();

    updatePlayerFrame({
      rigidBody: rigidBody.current,
      controls,
      isRunning,
      isPaused,
      playerStats: effectivePlayerStats,
      isFacingLeft,
      setFacingLeft,
      setIsMoving,
      setIsLookingUp,
      setPlayerDirection: playerStore.setPlayerDirection,
      setPlayerPosition: playerStore.setPlayerPosition,
      camera: state.camera,
      activeEnemyContacts: activeEnemyContacts.current,
      lastDamageTime,
      takeDamage: playerStore.takeDamage,
    });

    const contacts = activeEnemyContacts.current;
    contacts.forEach((_, id) => {
      if (!getEnemyManager().hasEnemy(id)) {
        contacts.delete(id);
      }
    });

    const viewportBounds = getViewportBounds(
      state.camera,
      VIEWPORT_CONFIG.CAMERA_ZOOM,
    );
    gameStore.updateViewportBounds(viewportBounds);
  });

  // Determine current animation state
  const currentAnimation = getAnimationState({
    isMoving,
    isLookingUp,
  });

  // Animation frame
  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Characters,
    variant: AnimationVariant.Default,
    currentAnimation,
  });

  // Collision handler - track enemy contacts
  const handleIntersection = useCallback(
    (payload: IntersectionEnterPayload) => {
      const userData = payload.other.rigidBodyObject?.userData;

      if (!isEnemyUserData(userData)) return;
      activeEnemyContacts.current.set(userData.id, userData.damage);
    },
    [],
  );

  // Collision exit handler - remove enemy from contacts
  const handleIntersectionExit = useCallback(
    (payload: IntersectionExitPayload) => {
      const userData = payload.other.rigidBodyObject?.userData;

      if (!isEnemyUserData(userData)) return;
      activeEnemyContacts.current.delete(userData.id);
    },
    [],
  );

  // User data for collision detection
  const playerUserData = useMemo<PlayerUserData>(
    () => ({
      type: "player",
      characterId: selectedCharacterId,
    }),
    [selectedCharacterId],
  );

  return {
    rigidBody,
    isFacingLeft,
    frameIndex,
    playerUserData,
    handleIntersection,
    handleIntersectionExit,
  };
}
