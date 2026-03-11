/**
 * Integration tests for core gameplay loops.
 * Tests simulation systems (projectile manager, enemy manager) without React.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { setGameplayContext, getGameplayContext } from "../gameplayContext";
import { useSessionStore } from "@/store/sessionStore";
import { usePlayerStore } from "@/store/playerStore";
import { useGameStore } from "@/store/gameStore";
import { useWeaponsStore } from "@/store/weaponsStore";
import { getEnemy } from "@/data/config/enemiesNormalized";
import { getWeapon } from "@/data/config/weaponsNormalized";
import { toCentralizedProjectile } from "@/utils/weapons/toCentralizedProjectile";
import { CharacterId, EnemyId, WeaponId } from "@/types";
import { PauseReason } from "@/types/store";
import { resetEnemyManager, getEnemyManager } from "../enemyManager";
import { resetProjectileManager, getProjectileManager } from "../projectileManager";

const resetAll = () => {
  setGameplayContext(null);
  resetEnemyManager();
  resetProjectileManager();
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  usePlayerStore.setState(usePlayerStore.getInitialState(), true);
  useGameStore.setState(useGameStore.getInitialState(), true);
  useWeaponsStore.setState(useWeaponsStore.getInitialState(), true);
};

describe("core loop integration", () => {
  beforeEach(() => {
    resetAll();
  });

  it("one enemy, one projectile: enemy dies and death event is emitted", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);
    usePlayerStore.getState().setPlayerPosition({ x: 0, y: 0 });

    const enemyManager = getEnemyManager();
    const projectileManager = getProjectileManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    const weaponData = getWeapon(WeaponId.Sabra);
    if (!enemyData || !weaponData) throw new Error("Config not found");

    enemyManager.spawnEnemy("e1", EnemyId.StreetCats, { x: 0.5, y: 0 }, enemyData);
    expect(enemyManager.getCount()).toBe(1);

    const projectile = toCentralizedProjectile(
      {
        id: "p1",
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 10, y: 0 },
        duration: 2,
        damage: 10,
      },
      weaponData,
      WeaponId.Sabra,
      0,
      "normal"
    );
    projectileManager.addProjectile(projectile);

    const ctx = getGameplayContext();
    const projTickCtx = ctx.getProjectileTickContext();
    const enemyTickCtx = ctx.getEnemyTickContext();

    let deathEvents: ReturnType<typeof enemyManager.tick> = [];
    for (let i = 0; i < 10; i++) {
      const delta = 0.1;
      const t = i * delta;
      projectileManager.tick(delta, t, projTickCtx);
      deathEvents = enemyManager.tick(delta, t, enemyTickCtx);
      if (deathEvents.length > 0) break;
    }

    expect(deathEvents).toHaveLength(1);
    expect(deathEvents[0]!.id).toBe("e1");
    expect(enemyManager.getCount()).toBe(0);
  });

  it("level-up + upgrade choice + apply upgrade + resume", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);

    const session = useSessionStore.getState();
    expect(session.level).toBe(1);

    session.addXp(150);

    let state = useSessionStore.getState();
    expect(state.level).toBe(2);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);

    const choice = state.upgradeChoices[0]!;
    state.applyUpgrade(choice);

    state = useSessionStore.getState();
    expect(state.isPaused).toBe(false);
    expect(state.pauseReason).toBe(PauseReason.None);

    const weapons = useWeaponsStore.getState();
    expect(weapons.activeWeapons.length).toBeGreaterThanOrEqual(1);
  });

  it("multi-enemy wave: spawn, damage, death rewards", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);
    usePlayerStore.getState().setPlayerPosition({ x: 0, y: 0 });

    const enemyManager = getEnemyManager();
    const projectileManager = getProjectileManager();
    const enemyData = getEnemy(EnemyId.StreetCats);
    const weaponData = getWeapon(WeaponId.Sabra);
    if (!enemyData || !weaponData) throw new Error("Config not found");

    enemyManager.spawnEnemy("e1", EnemyId.StreetCats, { x: 0.5, y: 0 }, enemyData);
    enemyManager.spawnEnemy("e2", EnemyId.StreetCats, { x: 1.5, y: 0 }, enemyData);
    enemyManager.spawnEnemy("e3", EnemyId.StreetCats, { x: 2.5, y: 0 }, enemyData);

    expect(enemyManager.getCount()).toBe(3);

    const projectiles = [0, 1, 2].map((i) =>
      toCentralizedProjectile(
        {
          id: `p${i}`,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 15, y: 0 },
          duration: 3,
          damage: 10,
          pierce: 2,
        },
        weaponData,
        WeaponId.Sabra,
        0,
        "normal"
      )
    );
    projectileManager.addProjectiles(projectiles);

    const ctx = getGameplayContext();
    const projTickCtx = ctx.getProjectileTickContext();
    const enemyTickCtx = ctx.getEnemyTickContext();

    const allDeaths: { id: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const delta = 0.1;
      const t = i * delta;
      projectileManager.tick(delta, t, projTickCtx);
      const deaths = enemyManager.tick(delta, t, enemyTickCtx);
      allDeaths.push(...deaths.map((d) => ({ id: d.id })));
    }

    expect(allDeaths.length).toBeGreaterThanOrEqual(1);
    expect(enemyManager.getCount()).toBeLessThan(3);
  });
});
