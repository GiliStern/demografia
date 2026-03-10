import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "./gameStore";

const resetEnemyStore = () => {
  useGameStore.getState().resetEnemies();
};

describe("enemiesStore registry", () => {
  beforeEach(() => {
    resetEnemyStore();
  });

  it("registers, updates, and removes enemy positions without exposing stale entries", () => {
    const store = useGameStore.getState();

    store.registerEnemy("enemy-1", { x: 1, y: 2 });
    expect(store.getEnemyPosition("enemy-1")).toEqual({ x: 1, y: 2 });
    expect(store.hasEnemy("enemy-1")).toBe(true);

    store.updateEnemyPosition("enemy-1", { x: 5, y: 8 });
    expect(store.getEnemyPosition("enemy-1")).toEqual({ x: 5, y: 8 });

    store.removeEnemy("enemy-1");
    expect(store.getEnemyPosition("enemy-1")).toBeUndefined();
    expect(store.hasEnemy("enemy-1")).toBe(false);
  });

  it("routes damage through registered callbacks and unregisters them on removal", () => {
    const store = useGameStore.getState();
    const onDamage = vi.fn();

    store.registerEnemy("enemy-1", { x: 0, y: 0 });
    store.registerEnemyDamageCallback("enemy-1", onDamage);

    store.damageEnemy("enemy-1", 7);
    expect(onDamage).toHaveBeenCalledWith(7);

    store.removeEnemy("enemy-1");
    store.damageEnemy("enemy-1", 3);
    expect(onDamage).toHaveBeenCalledTimes(1);
  });

  it("clears positions and callbacks on reset", () => {
    const store = useGameStore.getState();
    const onDamage = vi.fn();

    store.registerEnemy("enemy-1", { x: 0, y: 0 });
    store.registerEnemyDamageCallback("enemy-1", onDamage);
    store.addKill();
    expect(useGameStore.getState().killCount).toBe(1);

    store.resetEnemies();

    expect(useGameStore.getState().getEnemyPositions().size).toBe(0);
    expect(useGameStore.getState().killCount).toBe(0);

    store.damageEnemy("enemy-1", 10);
    expect(onDamage).not.toHaveBeenCalled();
  });
});
