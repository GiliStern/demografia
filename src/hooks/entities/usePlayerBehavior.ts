import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  RapierRigidBody,
  IntersectionEnterPayload,
  IntersectionExitPayload,
} from "@react-three/rapier";
import { useKeyboardControls } from "../controls/useKeyboardControls";
import { useGameStore } from "@/store/gameStore";
import { useSpriteAnimation } from "../rendering/useSpriteAnimation";
import { isEnemyUserData } from "@/utils/validation/userDataGuards";
import {
  getAnimationState,
  updatePlayerFrame,
} from "@/utils/player/playerControls";
import { getViewportBounds } from "@/utils/rendering/viewportBounds";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";
import { AnimationCategory, AnimationVariant, type PlayerUserData } from "@/types";
import type { UsePlayerBehaviorReturn } from "@/types/hooks/entities";

/**
 * Custom hook for player behavior - handles movement, collision, damage, and animation
 */
export function usePlayerBehavior(): UsePlayerBehaviorReturn {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useKeyboardControls();

  // Zustand selectors - selective to prevent unnecessary re-renders
  const getEffectivePlayerStats = useGameStore((state) => state.getEffectivePlayerStats);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setPlayerDirection = useGameStore((state) => state.setPlayerDirection);
  const takeDamage = useGameStore((state) => state.takeDamage);
  const selectedCharacterId = useGameStore(
    (state) => state.selectedCharacterId
  );
  const isRunning = useGameStore((state) => state.isRunning);
  const isPaused = useGameStore((state) => state.isPaused);
  const enemiesPositions = useGameStore((state) => state.enemiesPositions);

  // Local state
  const [isFacingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Refs for damage tracking
  const lastDamageTime = useRef(0);
  const activeEnemyContacts = useRef<Map<string, number>>(new Map());

  // Movement and viewport update
  useFrame((state) => {
    // Get effective player stats with passive bonuses applied
    const effectivePlayerStats = getEffectivePlayerStats();
    
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
      setPlayerDirection,
      setPlayerPosition,
      camera: state.camera,
      activeEnemyContacts: activeEnemyContacts.current,
      lastDamageTime,
      takeDamage,
    });

    // Calculate and update viewport bounds for viewport-relative game systems
    const viewportBounds = getViewportBounds(
      state.camera,
      VIEWPORT_CONFIG.CAMERA_ZOOM
    );
    useGameStore.getState().updateViewportBounds(viewportBounds);
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
    []
  );

  // Collision exit handler - remove enemy from contacts
  const handleIntersectionExit = useCallback(
    (payload: IntersectionExitPayload) => {
      const userData = payload.other.rigidBodyObject?.userData;

      if (!isEnemyUserData(userData)) return;
      activeEnemyContacts.current.delete(userData.id);
    },
    []
  );

  // Clean up contacts for enemies that no longer exist
  useEffect(() => {
    const contacts = activeEnemyContacts.current;
    contacts.forEach((_, id) => {
      if (!enemiesPositions[id]) {
        contacts.delete(id);
      }
    });
  }, [enemiesPositions]);

  // User data for collision detection
  const playerUserData = useMemo<PlayerUserData>(
    () => ({
      type: "player",
      characterId: selectedCharacterId,
    }),
    [selectedCharacterId]
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
