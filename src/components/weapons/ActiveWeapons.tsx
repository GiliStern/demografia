import { useMemo } from "react";
import { buildWeaponRenderList } from "@/utils/weaponUtils";
import type { WeaponComponentRegistry } from "@/types";
import { useGameStore } from "../../hooks/useGameStore";
import { WeaponId } from "../../types";
import { ProjectileWeapon } from "./ProjectileWeapon";
import { NearestProjectileWeapon } from "./NearestProjectileWeapon";
import { BounceWeapon } from "./BounceWeapon";
import { OrbitWeapon } from "./OrbitWeapon";
import { ArcWeapon } from "./ArcWeapon";
import { RadialWeapon } from "./RadialWeapon";

const weaponComponentRegistry: WeaponComponentRegistry = {
  [WeaponId.Sabra]: NearestProjectileWeapon,
  [WeaponId.KeterChairs]: BounceWeapon,
  [WeaponId.Pitas]: ArcWeapon,
  [WeaponId.StarOfDavid]: ProjectileWeapon,
  [WeaponId.HolyCactus]: NearestProjectileWeapon,
  [WeaponId.NoFuture]: BounceWeapon,
  [WeaponId.BurekasOfDeath]: RadialWeapon,
  [WeaponId.ThousandEdge]: ProjectileWeapon,
  [WeaponId.Kaparot]: OrbitWeapon,
  [WeaponId.UnholySelichot]: OrbitWeapon,
};

export const ActiveWeapons = () => {
  const activeWeaponIds = useGameStore((state) => state.activeWeapons);

  const renderList = useMemo(
    () =>
      buildWeaponRenderList({
        activeWeaponIds,
        registry: weaponComponentRegistry,
      }),
    [activeWeaponIds]
  );

  return (
    <>
      {renderList.map(({ key, Component, weaponId }) => (
        <Component key={key} weaponId={weaponId} />
      ))}
    </>
  );
};
