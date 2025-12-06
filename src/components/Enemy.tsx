import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  type IntersectionEnterHandler,
} from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { useGameStore } from "../store/gameStore";
import * as THREE from "three";
import { ENEMIES } from "../data/config/enemies";
import type { EnemyId, EnemyUserData, RigidBodyUserData } from "@/types";

interface EnemyProps {
  id: string;
  typeId: EnemyId;
  position: [number, number, number];
  onDeath: () => void;
}

export const Enemy = ({ id, typeId, position, onDeath }: EnemyProps) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const { playerPosition, isPaused, isRunning, addXp, addGold } =
    useGameStore();
  const [isFacingLeft, setFacingLeft] = useState(false);

  // Load stats from data
  const enemy = ENEMIES[typeId];
  const speed = enemy?.stats.speed ?? 2;
  const maxHp = enemy?.stats.hp ?? 10;
  const contactDamage = enemy?.stats.damage ?? 1;
  const [hp, setHp] = useState(maxHp);

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
  });

  const handleIntersection: IntersectionEnterHandler = (payload) => {
    const userData = payload.other.rigidBodyObject?.userData as
      | RigidBodyUserData
      | undefined;

    if (userData?.type === "projectile") {
      const newHp = hp - userData.damage;
      setHp(newHp);

      // Flash effect could go here

      if (newHp <= 0) {
        addXp(10); // Value from data
        addGold(1);
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
      <CuboidCollider args={[0.3, 0.3, 1]} />
      <Sprite flipX={isFacingLeft} {...enemy.sprite_config} />
    </RigidBody>
  );
};
