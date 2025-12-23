import { memo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { ENEMIES } from "../data/config/enemies";
import type { EnemyId } from "@/types";
import { useEnemyBehavior } from "@/hooks/entities/useEnemyBehavior";

interface EnemyProps {
  id: string;
  typeId: EnemyId;
  position: [number, number, number];
  onDeath: () => void;
}

const EnemyComponent = ({ id, typeId, position, onDeath }: EnemyProps) => {
  const {
    rigidBody,
    isFacingLeft,
    frameIndex,
    enemyUserData,
    handleIntersection,
  } = useEnemyBehavior({ id, typeId, position, onDeath });

  const enemy = ENEMIES[typeId];

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

// Memoize component to prevent unnecessary re-renders
export const Enemy = memo(EnemyComponent);
