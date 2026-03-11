import type { WeaponId } from "@/types";
import { useWeaponFiringLoop } from "./useWeaponFiringLoop";

/**
 * Bounce weapon - fires projectiles in random directions that bounce at screen edges.
 * Bounce simulation is handled by the projectile manager.
 */
export function useBounceWeapon({
  weaponId,
}: {
  weaponId: WeaponId;
}): void {
  useWeaponFiringLoop({
    weaponId,
    targeting: "randomDirection",
    behaviorType: "bounce",
  });
}
