import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  RapierRigidBody,
  IntersectionEnterHandler,
} from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { useSessionStore } from "@/store/sessionStore";
import { getPlayerPositionSnapshot } from "@/store/gameStoreAccess";
import { useSpriteAnimation } from "../rendering/useSpriteAnimation";
import { getEnemy } from "@/data/config/enemiesNormalized";
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

const _direction = new THREE.Vector3();

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
  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);
  const addGold = useSessionStore((state) => state.addGold);
  const updateEnemyPosition = useGameStore(
    (state) => state.updateEnemyPosition
  );
  const addXpOrb = useGameStore((state) => state.addXpOrb);
  const addKill = useGameStore((state) => state.addKill);
  const registerEnemy = useGameStore((state) => state.registerEnemy);
  const registerEnemyDamageCallback = useGameStore(
    (state) => state.registerEnemyDamageCallback
  );
  const removeEnemy = useGameStore((state) => state.removeEnemy);

  // Local state
  const [isFacingLeft, setFacingLeft] = useState(false);

  // Load enemy data (fallback for invalid typeId to satisfy hooks rules)
  const enemyOrFallback = getEnemy(typeId);
  const enemy = enemyOrFallback ?? {
    stats: {
      speed: 0,
      hp: 1,
      damage: 0,
      xpDrop: 0,
      knockbackResistance: 0,
    },
    spriteConfig: { textureUrl: "", index: 0, scale: 1 },
  };
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

    // Calculate direction to player (use getState to avoid re-renders on every player move)
    const playerPosition = getPlayerPositionSnapshot();
    _direction.set(
      playerPosition.x - rigidBody.current.translation().x,
      playerPosition.y - rigidBody.current.translation().y,
      0
    );

    if (_direction.length() > 0.1) {
      _direction.normalize().multiplyScalar(speed);
      rigidBody.current.setLinvel(
        { x: _direction.x, y: _direction.y, z: 0 },
        true
      );

      // Update facing direction
      if (_direction.x < 0 && !isFacingLeft) setFacingLeft(true);
      if (_direction.x > 0 && isFacingLeft) setFacingLeft(false);
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
