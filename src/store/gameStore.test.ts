import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore, collectUpgradeChoices } from "./gameStore";
import { usePlayerStore } from "./playerStore";
import { useSessionStore } from "./sessionStore";
import { useWeaponsStore } from "./weaponsStore";
import { resetEnemyManager } from "@/simulation/enemyManager";
import { buildEnemyDeathRewards } from "@/utils/entities/enemyLifecycle";
import {
  CharacterId,
  ItemKind,
  PassiveId,
  PauseReason,
  WeaponId,
} from "@/types";

const resetStore = () => {
  resetEnemyManager();
  useGameStore.getState().clearProjectiles();
  useGameStore.getState().resetXpOrbs();
  useGameStore.setState(useGameStore.getInitialState(), true);
  usePlayerStore.setState(usePlayerStore.getInitialState(), true);
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  useWeaponsStore.setState(useWeaponsStore.getInitialState(), true);
};

describe("gameStore progression", () => {
  beforeEach(() => {
    resetStore();
  });

  it("preserves overflow XP when leveling up", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);

    useSessionStore.getState().addXp(150);

    const state = useSessionStore.getState();
    expect(state.level).toBe(2);
    expect(state.xp).toBe(50);
    expect(state.nextLevelXp).toBe(120);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.pendingLevelUps).toBe(0);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);
  });

  it("queues repeated level gains from a single XP pickup", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);

    useSessionStore.getState().addXp(250);

    let state = useSessionStore.getState();
    expect(state.level).toBe(3);
    expect(state.xp).toBe(30);
    expect(state.nextLevelXp).toBe(144);
    expect(state.pendingLevelUps).toBe(1);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);

    const firstChoice = state.upgradeChoices[0];
    expect(firstChoice).toBeDefined();
    state.applyUpgrade(firstChoice!);

    state = useSessionStore.getState();
    expect(state.pendingLevelUps).toBe(0);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);

    const secondChoice = state.upgradeChoices[0];
    expect(secondChoice).toBeDefined();
    state.applyUpgrade(secondChoice!);

    state = useSessionStore.getState();
    expect(state.isPaused).toBe(false);
    expect(state.pauseReason).toBe(PauseReason.None);
    expect(state.pendingLevelUps).toBe(0);
  });
});

describe("gameStore evolution upgrades", () => {
  beforeEach(() => {
    resetStore();
  });

  it("offers explicit evolution choices for maxed weapons with required passives", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);
    useWeaponsStore.setState({
      activeWeapons: [WeaponId.Sabra],
      weaponLevels: { [WeaponId.Sabra]: 8 },
      activeItems: [PassiveId.Wassach],
      passiveLevels: { [PassiveId.Wassach]: 1 },
    });

    const choices = collectUpgradeChoices(useWeaponsStore.getState());
    const evolutionChoice = choices.find(
      (choice) =>
        choice.kind === ItemKind.Weapon &&
        choice.weaponId === WeaponId.HolyCactus &&
        choice.evolvesFrom === WeaponId.Sabra,
    );

    expect(evolutionChoice).toEqual(
      expect.objectContaining({
        kind: ItemKind.Weapon,
        weaponId: WeaponId.HolyCactus,
        isNew: false,
        currentLevel: 8,
        evolvesFrom: WeaponId.Sabra,
      }),
    );
  });

  it("replaces the base weapon when applying an evolution", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);
    useWeaponsStore.setState({
      activeWeapons: [WeaponId.Sabra],
      weaponLevels: { [WeaponId.Sabra]: 8 },
      activeItems: [PassiveId.Wassach],
      passiveLevels: { [PassiveId.Wassach]: 1 },
    });

    const evolutionChoice = collectUpgradeChoices(useWeaponsStore.getState()).find(
      (choice) =>
        choice.kind === ItemKind.Weapon &&
        choice.weaponId === WeaponId.HolyCactus &&
        choice.evolvesFrom === WeaponId.Sabra,
    );

    expect(evolutionChoice).toBeDefined();

    useSessionStore.getState().applyUpgrade(evolutionChoice!);

    const state = useWeaponsStore.getState();
    expect(state.activeWeapons).toEqual([WeaponId.HolyCactus]);
    expect(state.weaponLevels[WeaponId.HolyCactus]).toBe(1);
    expect(state.weaponLevels[WeaponId.Sabra]).toBeUndefined();
  });
});

describe("gameStore upgrade flow", () => {
  beforeEach(() => {
    resetStore();
  });

  it("applies upgrade and consumes level-up choice", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);

    useSessionStore.getState().addXp(150);

    const state = useSessionStore.getState();
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);

    const choice = state.upgradeChoices[0];
    expect(choice).toBeDefined();

    state.applyUpgrade(choice!);

    const afterState = useSessionStore.getState();
    expect(afterState.pauseReason).toBe(PauseReason.None);
    expect(afterState.isPaused).toBe(false);

    const weaponsState = useWeaponsStore.getState();
    expect(
      weaponsState.activeWeapons.length > 0 ||
        weaponsState.activeItems.length > 0 ||
        Object.keys(weaponsState.weaponLevels).length > 0 ||
        Object.keys(weaponsState.passiveLevels).length > 0,
    ).toBe(true);
  });
});

describe("enemy death rewards flow", () => {
  beforeEach(() => {
    resetStore();
  });

  it("adds xp orb, gold, and kill to store when applying death rewards", () => {
    useSessionStore.getState().startGame(CharacterId.Srulik);

    const rewards = buildEnemyDeathRewards({
      position: { x: 10, y: 5 },
      xpValue: 25,
      goldReward: 2,
      createOrbId: () => "xp-death-test",
    });

    useGameStore.getState().addXpOrb(rewards.xpOrb);
    useSessionStore.getState().addGold(rewards.goldReward);
    if (rewards.killIncrement > 0) {
      useSessionStore.getState().addKill();
    }

    const gameState = useGameStore.getState();
    expect(gameState.xpOrbsMap.has("xp-death-test")).toBe(true);
    expect(gameState.xpOrbsMap.get("xp-death-test")?.xpValue).toBe(25);

    const sessionState = useSessionStore.getState();
    expect(sessionState.gold).toBe(2);
    expect(sessionState.killCount).toBe(1);
  });
});
