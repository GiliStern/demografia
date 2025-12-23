import type { MutableRefObject } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { WeaponId, ProjectileData, SpriteConfig } from "../../types";
import type { WEAPONS } from "@/data/config/weaponsConfig";
import type { buildWeaponRuntime } from "@/utils/weapons/weaponLifecycle";

// ===========================
// Bounce Weapon Hook Types
// ===========================

export interface BounceProjectile extends ProjectileData {
  velocity: { x: number; y: number };
  birth: number;
}

export interface UseBounceWeaponParams {
  weaponId: WeaponId;
}

export interface UseBounceWeaponReturn {
  projectiles: BounceProjectile[];
  bodiesRef: MutableRefObject<Map<string, RapierRigidBody>>;
  weapon: (typeof WEAPONS)[WeaponId];
  damage: number;
}

// ===========================
// Orbit Weapon Hook Types
// ===========================

export interface OrbitingOrb {
  id: string;
  angleOffset: number;
  spawnedAt: number;
}

export interface OrbitWeaponInstance {
  orbiters: OrbitingOrb[];
  spriteConfig: SpriteConfig;
  damage: number;
  radius: number;
  baseAngleRef: MutableRefObject<number>;
  playerPosition: { x: number; y: number };
}

// ===========================
// Radial Weapon Hook Types
// ===========================

export type RadialProjectile = {
  birth: number;
} & ProjectileData;

export interface UseRadialWeaponParams {
  weaponId: WeaponId;
}

export interface UseRadialWeaponReturn {
  projectiles: RadialProjectile[];
  bodiesRef: MutableRefObject<Map<string, RapierRigidBody>>;
  weapon: (typeof WEAPONS)[WeaponId];
  runtime: ReturnType<typeof buildWeaponRuntime>;
}

// ===========================
// Common Weapon Hook Types
// ===========================

export interface ProjectileWeaponHookParams {
  weaponId: WeaponId;
}
