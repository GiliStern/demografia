import type { WeaponId } from "@/types";
import { useWeaponFiringLoop } from "./useWeaponFiringLoop";

/**
 * Nearest-enemy-targeting projectile weapon
 * Uses centralized projectile store for batched rendering.
 */
export function useNearestProjectileWeapon({
  weaponId,
}: {
  weaponId: WeaponId;
}): void {
  useWeaponFiringLoop({
    weaponId,
    targeting: "nearestEnemy",
    useStagger: true,
  });
}
