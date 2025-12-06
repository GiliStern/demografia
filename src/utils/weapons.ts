import type {
  ActiveWeaponRenderItem,
  WeaponComponentRegistry,
  WeaponStats,
  WeaponData,
  SpriteConfig,
} from "../types";
import { type WeaponId } from "../data/config/weapons";

interface BuildWeaponRenderListParams {
  activeWeaponIds: WeaponId[];
  registry: WeaponComponentRegistry;
}

/**
 * Turns the current weapon ids into a renderable list while skipping any ids
 * that do not yet have an associated component. Keys include the index so the
 * same weapon can be rendered multiple times in the future (upgrades, stacks).
 */
export const buildWeaponRenderList = ({
  activeWeaponIds,
  registry,
}: BuildWeaponRenderListParams): ActiveWeaponRenderItem[] => {
  return activeWeaponIds.reduce<ActiveWeaponRenderItem[]>(
    (list, weaponId, index) => {
      const WeaponComponent = registry[weaponId];
      if (!WeaponComponent) return list;

      list.push({
        weaponId,
        key: `${weaponId}-${index}`,
        Component: WeaponComponent,
      });
      return list;
    },
    []
  );
};

export const DEFAULT_WEAPON_STATS: WeaponStats = {
  damage: 0,
  speed: 0,
  cooldown: Number.POSITIVE_INFINITY,
  duration: 0,
  area: 1,
  amount: 1,
  pierce: 0,
};

export const resolveDirection = (x: number, y: number) => {
  if (x === 0 && y === 0) return { x: 1, y: 0 };
  return { x, y };
};

export interface ResolvedWeaponData {
  weaponData: WeaponData;
  stats: WeaponStats;
  spriteConfig?: SpriteConfig;
}

export const pickWeaponData = (
  weaponId: WeaponId,
  catalog: Record<WeaponId, WeaponData>
): ResolvedWeaponData => {
  const weaponData = catalog[weaponId];
  return {
    weaponData,
    stats: weaponData.stats ?? DEFAULT_WEAPON_STATS,
    spriteConfig: weaponData.sprite_config,
  };
};
