/**
 * Physics and rigid body user data types.
 */

import type { CharacterId, EnemyId } from "./domain";

export interface PlayerUserData {
  type: "player";
  characterId: CharacterId;
}

export interface EnemyUserData {
  type: "enemy";
  id: string;
  enemyId: EnemyId;
  damage: number;
}

export interface ProjectileUserData {
  type: "projectile";
  id: string;
  damage: number;
  owner: "player" | "enemy";
}

export interface XpOrbUserData {
  type: "xpOrb";
  id: string;
  xpValue: number;
}

export type RigidBodyUserData =
  | PlayerUserData
  | EnemyUserData
  | ProjectileUserData
  | XpOrbUserData;
