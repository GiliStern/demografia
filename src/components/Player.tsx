import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { getCharacter } from "../data/config/charactersNormalized";
import { useGameStore } from "@/store/gameStore";
import { usePlayerBehavior } from "../hooks/entities/usePlayerBehavior";

export const Player = () => {
  const selectedCharacterId = useGameStore(
    (state) => state.selectedCharacterId
  );
  const charData = getCharacter(selectedCharacterId);

  const {
    rigidBody,
    isFacingLeft,
    frameIndex,
    playerUserData,
    handleIntersection,
    handleIntersectionExit,
  } = usePlayerBehavior();

  if (!charData) return null;

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
        {...charData.spriteConfig}
        index={frameIndex}
        flipX={isFacingLeft}
      />
    </RigidBody>
  );
};
