import { useMemo } from "react";
import { buildWeaponRenderList } from "@/utils/weapons";
import type { WeaponComponentRegistry } from "@/types";
import { useGameStore } from "../../store/gameStore";
import { WeaponId } from "../../data/config/weapons";
import { ProjectileWeapon } from "./ProjectileWeapon";

const weaponComponentRegistry: WeaponComponentRegistry = {
  [WeaponId.Prickly]: ProjectileWeapon,
  [WeaponId.StarOfDavid]: ProjectileWeapon,
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
