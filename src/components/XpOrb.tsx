import { memo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { sprites } from "../assets/assetPaths";
import { useXpOrbBehavior } from "../hooks/entities/useXpOrbBehavior";

export interface XpOrbProps {
  id: string;
  position: [number, number, number];
  xpValue: number;
}

const XpOrbComponent = ({ id, position, xpValue }: XpOrbProps) => {
  const { rigidBody, isAttracted, xpOrbUserData, handleIntersection } =
    useXpOrbBehavior({ id, position, xpValue });

  return (
    <RigidBody
      ref={rigidBody}
      position={position}
      lockRotations
      type="kinematicPosition"
      userData={xpOrbUserData}
      onIntersectionEnter={handleIntersection}
      gravityScale={0}
    >
      <CuboidCollider args={[0.25, 0.25, 0.25]} sensor />
      <Sprite
        textureUrl={sprites.xp}
        index={0}
        scale={isAttracted ? 0.8 : 0.6}
        spriteFrameSize={36}
      />
    </RigidBody>
  );
};

// Memoize component to prevent unnecessary re-renders
export const XpOrb = memo(XpOrbComponent);
