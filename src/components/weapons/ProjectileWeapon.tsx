import type { WeaponComponentProps } from "../../types";
import { useProjectileWeapon } from "../../hooks/weapons/useProjectileWeapon";

/**
 * ProjectileWeapon - Fires projectiles in player's direction with spread
 * Now uses centralized batched rendering for performance
 */
export const ProjectileWeapon = ({ weaponId }: WeaponComponentProps) => {
  // Hook handles all logic and adds projectiles to central store
  useProjectileWeapon({ weaponId });

  // No rendering needed - BatchedProjectileRenderer handles it
  return null;
};
