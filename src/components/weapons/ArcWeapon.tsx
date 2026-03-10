import type { WeaponComponentProps } from "@/types";
import { useArcWeapon } from "@/hooks/weapons/useArcWeapon";

export const ArcWeapon = ({ weaponId }: WeaponComponentProps) => {
  useArcWeapon({ weaponId });
  return null;
};
