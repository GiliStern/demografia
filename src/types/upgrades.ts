/**
 * Upgrade-related types.
 */

import type { PassiveId, WeaponId } from "./domain";

export enum ItemKind {
  Weapon = "weapon",
  Passive = "passive",
}

export interface WeaponUpgradeOption {
  kind: ItemKind.Weapon;
  weaponId: WeaponId;
  isNew: boolean;
  currentLevel: number;
  evolvesFrom?: WeaponId;
}

export interface PassiveUpgradeOption {
  kind: ItemKind.Passive;
  passiveId: PassiveId;
  isNew: boolean;
  currentLevel: number;
}

export type UpgradeOption = WeaponUpgradeOption | PassiveUpgradeOption;
