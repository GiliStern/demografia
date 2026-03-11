import type { PlayerStats, WeaponStats } from "@/types";

export interface WeaponRuntime {
  damage: number;
  speed: number;
  duration: number;
  amount: number;
  cooldown: number;
  pierce: number;
}

export const buildWeaponRuntime = (
  stats: WeaponStats,
  playerStats: PlayerStats
): WeaponRuntime => ({
  damage: stats.damage * (playerStats.might || 1),
  speed: stats.speed,
  duration: stats.duration,
  amount: stats.amount,
  cooldown: (stats.cooldown ?? Number.POSITIVE_INFINITY) * playerStats.cooldown,
  pierce: stats.pierce ?? 0,
});

export const shouldFire = (
  time: number,
  lastFireTime: number,
  cooldown: number
): boolean => time - lastFireTime > cooldown;

export const filterByDuration = <T extends { birth: number }>(
  items: T[],
  duration: number,
  time: number
): T[] => {
  if (duration <= 0) return items;
  return items.filter((item) => time - item.birth <= duration);
};

