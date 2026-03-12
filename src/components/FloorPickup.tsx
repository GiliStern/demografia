import { memo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Sprite } from "./Sprite";
import { FLOOR_PICKUPS } from "@/data/config/floorPickups";
import { useFloorPickupBehavior } from "@/hooks/entities/useFloorPickupBehavior";
import { placeholders } from "@/assets/assetPaths";
import type { FloorPickupInstance } from "@/types";

export interface FloorPickupProps {
  instance: FloorPickupInstance;
}

const DEFAULT_SPRITE = {
  textureUrl: placeholders.sprite,
  index: 0,
  scale: 0.6,
  spriteFrameSize: 64,
} as const;

const FloorPickupComponent = ({ instance }: FloorPickupProps) => {
  const { rigidBody } = useFloorPickupBehavior({
    id: instance.id,
    position: instance.position,
    pickupId: instance.pickupId,
    ...(instance.payload != null && { payload: instance.payload }),
  });

  const pickup = FLOOR_PICKUPS[instance.pickupId];
  const spriteConfig = pickup?.sprite_config ?? DEFAULT_SPRITE;

  return (
    <RigidBody
      ref={
        rigidBody as React.RefObject<
          import("@react-three/rapier").RapierRigidBody
        >
      }
      position={[instance.position.x, instance.position.y, 0]}
      lockRotations
      type="kinematicPosition"
      gravityScale={0}
    >
      <CuboidCollider args={[0.25, 0.25, 0.25]} sensor />
      <Sprite
        textureUrl={spriteConfig.textureUrl}
        index={spriteConfig.index}
        scale={spriteConfig.scale}
        spriteFrameSize={spriteConfig.spriteFrameSize ?? 64}
      />
    </RigidBody>
  );
};

export const FloorPickup = memo(FloorPickupComponent);
