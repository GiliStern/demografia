import { EnemyId, WeaponId } from "@/types";
import type { PhaserEnemy, PhaserProjectile, PhaserXpOrb, SpawnTracker } from "../types";
import { PhaserGameState } from "./PhaserGameState";

export class RuntimeState {
  game = new PhaserGameState();
  enemies = new Map<string, PhaserEnemy>();
  projectiles = new Map<string, PhaserProjectile>();
  xpOrbs = new Map<string, PhaserXpOrb>();
  spawnTracker: SpawnTracker = {};
  lastPlayerContactDamageAt = 0;
  lastWeaponFireAt: Partial<Record<WeaponId, number>> = {};

  resetRuntime(): void {
    this.enemies.clear();
    this.projectiles.clear();
    this.xpOrbs.clear();
    this.spawnTracker = {};
    this.lastPlayerContactDamageAt = 0;
    this.lastWeaponFireAt = {};
  }

  spawnEnemy(enemy: PhaserEnemy): void {
    this.enemies.set(enemy.id, enemy);
  }

  damageEnemy(enemyId: string, amount: number): boolean {
    const enemy = this.enemies.get(enemyId);
    if (!enemy) return false;

    enemy.hp -= amount;
    if (enemy.hp <= 0) {
      this.enemies.delete(enemyId);
      this.game.addKill();
      this.game.addGold(1);
      const orbId = `xp-${enemy.id}-${Date.now()}`;
      this.xpOrbs.set(orbId, {
        id: orbId,
        position: { ...enemy.position },
        xpValue: enemy.xpDrop,
        attracted: false,
        spawnTime: performance.now() / 1000,
      });
      return true;
    }
    return false;
  }

  addProjectile(projectile: PhaserProjectile): void {
    this.projectiles.set(projectile.id, projectile);
  }

  removeProjectile(id: string): void {
    this.projectiles.delete(id);
  }

  removeEnemy(id: string): void {
    this.enemies.delete(id);
  }

  removeOrb(id: string): void {
    this.xpOrbs.delete(id);
  }
}

export const runtimeState = new RuntimeState();

export const isWeaponProjectileType = (weaponType: string): boolean =>
  weaponType === "projectile_closest" ||
  weaponType === "projectile_bounce" ||
  weaponType === "projectile_directional" ||
  weaponType === "projectile_radial" ||
  weaponType === "projectile_arc" ||
  weaponType === "orbital";

export const weaponBehaviorType = (weaponId: WeaponId): PhaserProjectile["behaviorType"] => {
  if (weaponId === WeaponId.KeterChairs || weaponId === WeaponId.NoFuture) {
    return "bounce";
  }
  if (weaponId === WeaponId.Kaparot || weaponId === WeaponId.UnholySelichot) {
    return "orbit";
  }
  if (weaponId === WeaponId.Pitas) {
    return "arc";
  }
  return "normal";
};

export const buildEnemyId = (enemyType: EnemyId): string =>
  `${enemyType}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
