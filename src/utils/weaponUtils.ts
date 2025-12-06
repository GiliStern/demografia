import type {
  ActiveWeaponRenderItem,
  WeaponComponentRegistry,
  WeaponStats,
  WeaponDefinition,
  SpriteConfig,
  WeaponStatDelta,
} from "../types";
import { type WeaponId } from "../types";

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
  weaponData: WeaponDefinition;
  stats: WeaponStats;
  spriteConfig?: SpriteConfig;
}

const applyStatDelta = (
  current: WeaponStats,
  delta?: WeaponStatDelta
): WeaponStats => {
  if (!delta) return current;
  const next: WeaponStats = { ...current };

  if (delta.add) {
    for (const key of Object.keys(delta.add) as (keyof WeaponStats)[]) {
      const val = delta.add[key];
      if (typeof val === "number") {
        next[key] = (next[key] ?? 0) + val;
      }
    }
  }

  if (delta.mult) {
    for (const key of Object.keys(delta.mult) as (keyof WeaponStats)[]) {
      const val = delta.mult[key];
      if (typeof val === "number") {
        next[key] = (next[key] ?? 0) * val;
      }
    }
  }

  return next;
};

export const resolveWeaponStats = (
  weapon: WeaponDefinition,
  level: number
): WeaponStats => {
  let resolved = { ...DEFAULT_WEAPON_STATS, ...weapon.stats };
  const maxLevel = weapon.maxLevel ?? 1;
  const effectiveLevel = Math.max(1, Math.min(level, maxLevel));

  weapon.levels
    ?.filter((lvl) => lvl.level <= effectiveLevel)
    .sort((a, b) => a.level - b.level)
    .forEach((lvl) => {
      resolved = applyStatDelta(resolved, lvl.statChanges);
    });

  return resolved;
};

export const pickWeaponData = (
  weaponId: WeaponId,
  catalog: Record<WeaponId, WeaponDefinition>,
  level = 1
): ResolvedWeaponData => {
  const weaponData = catalog[weaponId];
  const stats = resolveWeaponStats(weaponData, level);
  return {
    weaponData,
    stats,
    spriteConfig: weaponData.sprite_config,
  };
};
