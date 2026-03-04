import { CharacterId, EnemyId, ItemKind, WeaponId, type UpgradeOption } from "@/types";

export interface Vector2Like {
  x: number;
  y: number;
}

export interface PhaserPlayerState {
  characterId: CharacterId;
  position: Vector2Like;
  direction: Vector2Like;
  facingLeft: boolean;
}

export interface PhaserEnemy {
  id: string;
  typeId: EnemyId;
  position: Vector2Like;
  hp: number;
  speed: number;
  damage: number;
  xpDrop: number;
  collisionRadius: number;
}

export interface PhaserProjectile {
  id: string;
  weaponId: WeaponId;
  behaviorType: "normal" | "bounce" | "homing" | "orbit" | "arc";
  position: Vector2Like;
  velocity: Vector2Like;
  damage: number;
  duration: number;
  spawnTime: number;
  pierceLeft: number;
  orbitAngle?: number;
  orbitRadius?: number;
}

export interface PhaserXpOrb {
  id: string;
  position: Vector2Like;
  xpValue: number;
  attracted: boolean;
  spawnTime: number;
}

export type SpawnTracker = Record<string, { lastSpawn: number }>;

export interface UpgradeChoiceDescriptor {
  choice: UpgradeOption;
  label: string;
  kind: ItemKind;
}
