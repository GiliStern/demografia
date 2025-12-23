import type { WeaponComponentProps } from "@/types";
import { useBounceWeapon } from "@/hooks/weapons/useBounceWeapon";

/**
 * BounceWeapon - Fires projectiles that bounce at screen edges
 * Now uses centralized batched rendering for performance
 */
export const BounceWeapon = ({ weaponId }: WeaponComponentProps) => {
  // Hook handles all logic and adds projectiles to central store
  useBounceWeapon({ weaponId });

  // No rendering needed - BatchedProjectileRenderer handles it
            return null;
};
