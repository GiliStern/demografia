import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  RapierRigidBody,
  IntersectionEnterHandler,
} from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { useSpriteAnimation } from "../rendering/useSpriteAnimation";
import { ENEMIES } from "@/data/config/enemies";
import { buildEnemyDeathRewards } from "@/utils/entities/enemyLifecycle";
import {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
  type RigidBodyUserData,
  type EnemyUserData,
} from "@/types";
import type {
  UseEnemyBehaviorParams,
  UseEnemyBehaviorReturn,
} from "@/types/hooks/entities";

/**
 * Custom hook for enemy behavior - handles movement AI, collision, damage, and death
 */
export function useEnemyBehavior({
  id,
  typeId,
  position,
  onDeath,
}: UseEnemyBehaviorParams): UseEnemyBehaviorReturn {
  const rigidBody = useRef<RapierRigidBody>(null);

  // Zustand selectors - selective to prevent unnecessary re-renders
  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const updateEnemyPosition = useGameStore(
    (state) => state.updateEnemyPosition
  );
  const addXpOrb = useGameStore((state) => state.addXpOrb);
  const addGold = useGameStore((state) => state.addGold);
  const addKill = useGameStore((state) => state.addKill);
  const registerEnemy = useGameStore((state) => state.registerEnemy);
  const registerEnemyDamageCallback = useGameStore(
    (state) => state.registerEnemyDamageCallback
  );
  const removeEnemy = useGameStore((state) => state.removeEnemy);

  // Local state
  const [isFacingLeft, setFacingLeft] = useState(false);

  // Load enemy data
  const enemy = ENEMIES[typeId];
  const speed = enemy.stats.speed;
  const maxHp = enemy.stats.hp;
  const contactDamage = enemy.stats.damage;

  // Health and death tracking
  const [hp, setHp] = useState(maxHp);
  const isDead = useRef(false);

  // Animation
  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Enemies,
    variant: AnimationVariant.Default,
    currentAnimation: AnimationType.Run,
  });

  // Use ref to store the latest HP value to avoid recreating callback
  const hpRef = useRef(hp);
  useEffect(() => {
    hpRef.current = hp;
  }, [hp]);

  const handleDeath = useCallback(() => {
    if (!rigidBody.current) {
      onDeath();
      return;
    }

    const pos = rigidBody.current.translation();
    const rewards = buildEnemyDeathRewards({
      position: { x: pos.x, y: pos.y },
      xpValue: enemy.stats.xpDrop,
    });

    addXpOrb(rewards.xpOrb);
    addGold(rewards.goldReward);
    if (rewards.killIncrement > 0) {
      addKill();
    }
    onDeath();
  }, [addGold, addKill, addXpOrb, enemy.stats.xpDrop, onDeath]);

  // Damage handler for batched projectile collisions - stable reference
  const handleDamage = useCallback(
    (damage: number) => {
      if (isDead.current) return;

      const newHp = hpRef.current - damage;
      setHp(newHp);

      if (newHp <= 0 && !isDead.current) {
        isDead.current = true;
        handleDeath();
      }
    },
    [handleDeath]
  );

  // Register enemy position and damage callback on mount, cleanup on unmount
  useEffect(() => {
    const [x, y] = position;

    registerEnemy(id, { x, y });
    registerEnemyDamageCallback(id, handleDamage);

    return () => {
      removeEnemy(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only run on mount - handleDamage uses refs for latest values

  // Collision handler - handles projectile hits and death (for old Rapier-based projectiles)
  const handleIntersection: IntersectionEnterHandler = useCallback(
    (payload) => {
      if (isDead.current) return;

      const userData = payload.other.rigidBodyObject?.userData as
        | RigidBodyUserData
        | undefined;

      if (userData?.type === "projectile") {
        const newHp = hpRef.current - userData.damage;
        setHp(newHp);

        if (newHp <= 0 && !isDead.current) {
          isDead.current = true;
          handleDeath();
        }
      }
    },
    [handleDeath]
  );

  // Movement AI - chase player
  useFrame(() => {
    if (!rigidBody.current) return;

    if (isPaused || !isRunning) {
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Calculate direction to player
    const direction = new THREE.Vector3(
      playerPosition.x - rigidBody.current.translation().x,
      playerPosition.y - rigidBody.current.translation().y,
      0
    );

    if (direction.length() > 0.1) {
      direction.normalize().multiplyScalar(speed);
      rigidBody.current.setLinvel(
        { x: direction.x, y: direction.y, z: 0 },
        true
      );

      // Update facing direction
      if (direction.x < 0 && !isFacingLeft) setFacingLeft(true);
      if (direction.x > 0 && isFacingLeft) setFacingLeft(false);
    } else {
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Update position in store
    const translation = rigidBody.current.translation();
    updateEnemyPosition(id, { x: translation.x, y: translation.y });
  });

  // User data for collision detection
  const enemyUserData: EnemyUserData = useMemo(
    () => ({
      type: "enemy",
      id,
      enemyId: typeId,
      damage: contactDamage,
    }),
    [id, typeId, contactDamage]
  );

  return {
    rigidBody,
    isFacingLeft,
    frameIndex,
    enemyUserData,
    handleIntersection,
  };
}
