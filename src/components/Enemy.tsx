import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterHandler,
} from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { useGameStore } from "../hooks/useGameStore";
import * as THREE from "three";
import { ENEMIES } from "../data/config/enemies";
import {
  AnimationCategory,
  AnimationType,
  AnimationVariant,
  type EnemyId,
  type EnemyUserData,
  type RigidBodyUserData,
} from "@/types";
import { useSpriteAnimation } from "@/hooks/useSpriteAnimation";

interface EnemyProps {
  id: string;
  typeId: EnemyId;
  position: [number, number, number];
  onDeath: () => void;
}

export const Enemy = ({ id, typeId, position, onDeath }: EnemyProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  // PERFORMANCE: Use selective zustand selectors to prevent unnecessary re-renders
  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  const addXpOrb = useGameStore((state) => state.addXpOrb);
  const addGold = useGameStore((state) => state.addGold);
  const addKill = useGameStore((state) => state.addKill);
  const registerEnemy = useGameStore((state) => state.registerEnemy);
  const updateEnemyPosition = useGameStore((state) => state.updateEnemyPosition);
  const removeEnemy = useGameStore((state) => state.removeEnemy);
  const [isFacingLeft, setFacingLeft] = useState(false);

  // Load stats from data
  const enemy = ENEMIES[typeId];

  const speed = enemy.stats.speed;
  const maxHp = enemy.stats.hp;
  const contactDamage = enemy.stats.damage;
  const [hp, setHp] = useState(maxHp);
  const isDead = useRef(false); // CRITICAL FIX: Prevent multiple death triggers
  const frameIndex = useSpriteAnimation({
    category: AnimationCategory.Enemies,
    variant: AnimationVariant.Default,
    currentAnimation: AnimationType.Run,
  });

  useEffect(() => {
    const [x, y] = position;
    registerEnemy(id, { x, y });
    return () => removeEnemy(id);
  }, [id, position, registerEnemy, removeEnemy]);

  useFrame(() => {
    if (!rigidBody.current) return;

    if (isPaused || !isRunning) {
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Simple AI: Move towards player
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

      // Face direction
      if (direction.x < 0 && !isFacingLeft) setFacingLeft(true);
      if (direction.x > 0 && isFacingLeft) setFacingLeft(false);
    } else {
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    const translation = rigidBody.current.translation();
    updateEnemyPosition(id, { x: translation.x, y: translation.y });
  });

  const handleIntersection: IntersectionEnterHandler = (payload) => {
    if (isDead.current) return; // Already dead, ignore further hits

    const userData = payload.other.rigidBodyObject?.userData as
      | RigidBodyUserData
      | undefined;

    if (userData?.type === "projectile") {
      const newHp = hp - userData.damage;
      setHp(newHp);

      // Flash effect could go here

      if (newHp <= 0 && !isDead.current) {
        isDead.current = true; // CRITICAL: Mark as dead immediately to prevent multiple triggers
        
        // Drop XP orb at enemy position
        if (rigidBody.current) {
          const pos = rigidBody.current.translation();
          // Use crypto.randomUUID() for truly unique IDs
          const orbId = crypto.randomUUID ? crypto.randomUUID() : `xp-${id}-${Date.now()}-${Math.random()}`;
          addXpOrb({
            id: orbId,
            position: { x: pos.x, y: pos.y },
            xpValue: enemy.stats.xpDrop,
          });
        }
        addGold(1);
        addKill();
        onDeath();
      }
    }
  };

  const enemyUserData: EnemyUserData = {
    type: "enemy",
    id,
    enemyId: typeId,
    damage: contactDamage,
  };

  return (
    <RigidBody
      ref={rigidBody}
      position={position}
      lockRotations
      friction={0}
      type="dynamic"
      userData={enemyUserData}
      onIntersectionEnter={handleIntersection}
    >
      <CuboidCollider args={[0.3, 0.3, 1]} sensor />
      <Sprite
        flipX={isFacingLeft}
        {...enemy.sprite_config}
        index={frameIndex}
      />
    </RigidBody>
  );
};
