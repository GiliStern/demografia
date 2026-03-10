import { beforeEach, describe, expect, it, vi } from "vitest";
import { enemyManager } from "./enemyManager";
import { useSessionStore } from "@/store/sessionStore";

const resetEnemyManager = () => {
  enemyManager.reset();
  useSessionStore.setState({ killCount: 0 });
};

describe("enemyManager registry", () => {
  beforeEach(() => {
    resetEnemyManager();
  });

  it("registers, updates, and removes enemy positions without exposing stale entries", () => {
    enemyManager.registerEnemy("enemy-1", { x: 1, y: 2 });
    expect(enemyManager.getEnemyPosition("enemy-1")).toEqual({ x: 1, y: 2 });
    expect(enemyManager.hasEnemy("enemy-1")).toBe(true);

    enemyManager.updateEnemyPosition("enemy-1", { x: 5, y: 8 });
    expect(enemyManager.getEnemyPosition("enemy-1")).toEqual({ x: 5, y: 8 });

    enemyManager.removeEnemy("enemy-1");
    expect(enemyManager.getEnemyPosition("enemy-1")).toBeUndefined();
    expect(enemyManager.hasEnemy("enemy-1")).toBe(false);
  });

  it("routes damage through registered callbacks and unregisters them on removal", () => {
    const onDamage = vi.fn();

    enemyManager.registerEnemy("enemy-1", { x: 0, y: 0 });
    enemyManager.registerEnemyDamageCallback("enemy-1", onDamage);

    enemyManager.damageEnemy("enemy-1", 7);
    expect(onDamage).toHaveBeenCalledWith(7);

    enemyManager.removeEnemy("enemy-1");
    enemyManager.damageEnemy("enemy-1", 3);
    expect(onDamage).toHaveBeenCalledTimes(1);
  });

  it("clears positions and callbacks on reset; killCount lives in sessionStore", () => {
    const onDamage = vi.fn();

    enemyManager.registerEnemy("enemy-1", { x: 0, y: 0 });
    enemyManager.registerEnemyDamageCallback("enemy-1", onDamage);
    useSessionStore.getState().addKill();
    expect(useSessionStore.getState().killCount).toBe(1);

    enemyManager.reset();

    expect(enemyManager.getEnemyPositions().size).toBe(0);
    expect(useSessionStore.getState().killCount).toBe(1);

    enemyManager.damageEnemy("enemy-1", 10);
    expect(onDamage).not.toHaveBeenCalled();
  });
});
