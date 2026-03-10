import type {
  CentralizedProjectile,
  ProjectileData,
  WeaponId,
} from "@/types";
import type { WeaponDefinitionRuntime } from "@/data/normalizeConfig";

/** Overrides for weapon-specific fields (e.g. arc acceleration). */
export interface ToCentralizedProjectileOverrides {
  acceleration?: { x: number; y: number; z?: number };
  flipX?: boolean;
}

/**
 * Maps ProjectileData (local shot) to CentralizedProjectile (batched render format).
 * Use this to eliminate duplicated mapping blocks across weapon hooks.
 */
export function toCentralizedProjectile(
  shot: ProjectileData,
  weapon: WeaponDefinitionRuntime,
  weaponId: WeaponId,
  spawnTime: number,
  behaviorType: CentralizedProjectile["behaviorType"] = "normal",
  overrides?: ToCentralizedProjectileOverrides
): CentralizedProjectile {
  const pos = shot.position;
  const vel = shot.velocity;
  return {
    id: shot.id,
    position: { x: pos.x, y: pos.y, z: pos.z },
    velocity: { x: vel.x, y: vel.y },
    damage: shot.damage,
    textureUrl: weapon.spriteConfig.textureUrl,
    spriteIndex: weapon.spriteConfig.index,
    spriteFrameSize: weapon.spriteConfig.spriteFrameSize ?? 32,
    scale: weapon.spriteConfig.scale,
    spawnTime,
    duration: shot.duration,
    weaponId,
    behaviorType,
    shouldSpin: weapon.shouldSpin,
    ...overrides,
  };
}
