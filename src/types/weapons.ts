/**
 * Weapon-specific types.
 */

import type { ComponentType } from "react";
import type {
  PassiveId,
  SpriteConfig,
  WeaponData,
  WeaponId,
  WeaponStats,
} from "./domain";
import type { ProjectileData } from "./rendering";

export interface WeaponStatDelta {
  add?: Partial<WeaponStats>;
  mult?: Partial<WeaponStats>;
}

export interface WeaponLevel {
  level: number;
  description: string;
  statChanges?: WeaponStatDelta;
}

export interface WeaponEvolution {
  passiveRequired: PassiveId;
  evolvesTo: WeaponId;
}

export interface WeaponDefinition extends WeaponData {
  maxLevel?: number;
  levels?: WeaponLevel[];
  evolution?: WeaponEvolution;
  shouldSpin: boolean;
}

export interface WeaponComponentProps {
  weaponId: WeaponId;
}

export type WeaponComponent = ComponentType<WeaponComponentProps>;

export interface ActiveWeaponRenderItem {
  weaponId: WeaponId;
  key: string;
  Component: WeaponComponent;
}

export type WeaponComponentRegistry = Partial<Record<WeaponId, WeaponComponent>>;

export interface ProjectileWeaponInstance {
  projectiles: ProjectileData[];
  spriteConfig: SpriteConfig;
  damage: number;
  removeProjectile: (id: string) => void;
  cooldown: number;
  speed: number;
  duration: number;
  amount: number;
  shouldSpin: boolean;
}
