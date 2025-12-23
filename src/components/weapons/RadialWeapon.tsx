import type { WeaponComponentProps } from "@/types";
import { useRadialWeapon } from "@/hooks/weapons/useRadialWeapon";

/**
 * RadialWeapon - Fires projectiles in all directions
 * Now uses centralized batched rendering for performance
 */
export const RadialWeapon = ({ weaponId }: WeaponComponentProps) => {
  // Hook handles all logic and adds projectiles to central store
  useRadialWeapon({ weaponId });

  // No rendering needed - BatchedProjectileRenderer handles it
  return null;
};
