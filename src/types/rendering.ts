/**
 * Rendering and animation types.
 */

import type { WeaponId } from "./domain";

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface ProjectileData {
  id: string;
  position: Position;
  velocity: Velocity;
  duration: number;
  damage: number;
  /** Number of enemies this projectile can hit before being removed; 0 = disappear on first hit. */
  pierce?: number;
}

export interface CentralizedProjectile {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z?: number };
  acceleration?: { x: number; y: number; z?: number };
  damage: number;
  textureUrl: string;
  spriteIndex: number;
  spriteFrameSize: number;
  scale: number;
  spawnTime: number;
  duration: number;
  flipX?: boolean;
  shouldSpin?: boolean;
  /** Number of frames in sprite; when 2+ and shouldSpin, animate */
  spriteFrameCount?: number;
  weaponId: WeaponId;
  behaviorType?: "normal" | "bounce" | "homing" | "arc";
  /** Number of enemies this projectile can hit before being removed; 0 = disappear on first hit. */
  pierce?: number;
  /** Knockback strength; applied when weapon knockback > enemy knockback_resistance */
  knockback?: number;
}

export enum AnimationType {
  Idle = "idle",
  Run = "run",
  IdleUp = "idle_up",
  RunUp = "run_up",
}

export enum AnimationCategory {
  Characters = "characters",
  Enemies = "enemies",
  Weapons = "weapons",
}

export interface AnimationConfig {
  frames: number[];
  frameRate: number;
  loop: boolean;
}

export enum AnimationVariant {
  Default = "default",
}
