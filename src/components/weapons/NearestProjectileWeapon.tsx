import type { WeaponComponentProps } from "../../types";
import { useNearestProjectileWeapon } from "../../hooks/weapons/useNearestProjectileWeapon";

/**
 * NearestProjectileWeapon - Fires projectiles toward nearest enemy
 * Now uses centralized batched rendering for performance
 */
export const NearestProjectileWeapon = ({ weaponId }: WeaponComponentProps) => {
  // Hook handles all logic and adds projectiles to central store
  useNearestProjectileWeapon({ weaponId });

  // No rendering needed - BatchedProjectileRenderer handles it
  return null;
};
