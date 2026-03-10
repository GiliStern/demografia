import type { WeaponId } from "@/types";
import { useWeaponFiringLoop } from "./useWeaponFiringLoop";

/**
 * Radial weapon - fires projectiles in all directions.
 * Uses centralized projectile store for batched rendering.
 */
export function useRadialWeapon({
  weaponId,
}: {
  weaponId: WeaponId;
}): void {
  useWeaponFiringLoop({
    weaponId,
    targeting: "radial",
  });
}
