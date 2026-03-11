import type { WeaponId } from "@/types";
import { useWeaponFiringLoop } from "./useWeaponFiringLoop";

/**
 * Projectile weapon - fires in player's direction with spread.
 * Uses centralized projectile store for batched rendering.
 */
export function useProjectileWeapon({
  weaponId,
}: {
  weaponId: WeaponId;
}): void {
  useWeaponFiringLoop({
    weaponId,
    targeting: "playerDirection",
    useStagger: true,
    spreadStep: 0.1,
  });
}
