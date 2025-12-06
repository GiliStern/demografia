import { useMemo } from "react";
import { buildWeaponRenderList } from "@/utils/weapons";
import type { WeaponComponentRegistry } from "@/types";
import { useGameStore } from "../../store/gameStore";
import { WeaponId } from "../../types";
import { ProjectileWeapon } from "./ProjectileWeapon";

const PlaceholderWeapon = () => null;

const weaponComponentRegistry: WeaponComponentRegistry = {
  [WeaponId.Sabra]: ProjectileWeapon,
  [WeaponId.KeterChairs]: ProjectileWeapon,
  [WeaponId.Pitas]: ProjectileWeapon,
  [WeaponId.StarOfDavid]: ProjectileWeapon,
  [WeaponId.HolyCactus]: ProjectileWeapon,
  [WeaponId.NoFuture]: ProjectileWeapon,
  [WeaponId.BurekasOfDeath]: ProjectileWeapon,
  [WeaponId.ThousandEdge]: ProjectileWeapon,
  [WeaponId.Kaparot]: PlaceholderWeapon,
  [WeaponId.UnholySelichot]: PlaceholderWeapon,
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
