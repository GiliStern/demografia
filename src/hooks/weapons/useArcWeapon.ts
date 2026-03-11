import type { WeaponId } from "@/types";
import { useWeaponFiringLoop } from "./useWeaponFiringLoop";

const ARC_GRAVITY = 9.8;
const ARC_MIN_ANGLE = Math.PI / 4;
const ARC_ANGLE_SPAN = Math.PI / 2;

/**
 * Arc weapon - fires projectiles in an upward arc with gravity.
 * Uses centralized projectile store for batched rendering.
 */
export function useArcWeapon({
  weaponId,
}: {
  weaponId: WeaponId;
}): void {
  useWeaponFiringLoop({
    weaponId,
    targeting: "arc",
    behaviorType: "arc",
    arcConfig: {
      gravity: ARC_GRAVITY,
      minAngle: ARC_MIN_ANGLE,
      angleSpan: ARC_ANGLE_SPAN,
    },
  });
}
