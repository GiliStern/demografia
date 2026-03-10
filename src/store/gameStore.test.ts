import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore, collectUpgradeChoices } from "./gameStore";
import {
  CharacterId,
  ItemKind,
  PassiveId,
  PauseReason,
  WeaponId,
} from "@/types";

const resetStore = () => {
  useGameStore.setState(useGameStore.getInitialState(), true);
};

describe("gameStore progression", () => {
  beforeEach(() => {
    resetStore();
  });

  it("preserves overflow XP when leveling up", () => {
    useGameStore.getState().startGame(CharacterId.Srulik);

    useGameStore.getState().addXp(150);

    const state = useGameStore.getState();
    expect(state.level).toBe(2);
    expect(state.xp).toBe(50);
    expect(state.nextLevelXp).toBe(120);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.pendingLevelUps).toBe(0);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);
  });

  it("queues repeated level gains from a single XP pickup", () => {
    useGameStore.getState().startGame(CharacterId.Srulik);

    useGameStore.getState().addXp(250);

    let state = useGameStore.getState();
    expect(state.level).toBe(3);
    expect(state.xp).toBe(30);
    expect(state.nextLevelXp).toBe(144);
    expect(state.pendingLevelUps).toBe(1);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);

    const firstChoice = state.upgradeChoices[0];
    expect(firstChoice).toBeDefined();
    state.applyUpgrade(firstChoice!);

    state = useGameStore.getState();
    expect(state.pendingLevelUps).toBe(0);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);

    const secondChoice = state.upgradeChoices[0];
    expect(secondChoice).toBeDefined();
    state.applyUpgrade(secondChoice!);

    state = useGameStore.getState();
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
    useGameStore.getState().startGame(CharacterId.Srulik);
    useGameStore.setState({
      activeWeapons: [WeaponId.Sabra],
      weaponLevels: { [WeaponId.Sabra]: 8 },
      activeItems: [PassiveId.Wassach],
      passiveLevels: { [PassiveId.Wassach]: 1 },
    });

    const choices = collectUpgradeChoices(useGameStore.getState());
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
    useGameStore.getState().startGame(CharacterId.Srulik);
    useGameStore.setState({
      activeWeapons: [WeaponId.Sabra],
      weaponLevels: { [WeaponId.Sabra]: 8 },
      activeItems: [PassiveId.Wassach],
      passiveLevels: { [PassiveId.Wassach]: 1 },
    });

    const evolutionChoice = collectUpgradeChoices(useGameStore.getState()).find(
      (choice) =>
        choice.kind === ItemKind.Weapon &&
        choice.weaponId === WeaponId.HolyCactus &&
        choice.evolvesFrom === WeaponId.Sabra,
    );

    expect(evolutionChoice).toBeDefined();

    useGameStore.getState().applyUpgrade(evolutionChoice!);

    const state = useGameStore.getState();
    expect(state.activeWeapons).toEqual([WeaponId.HolyCactus]);
    expect(state.weaponLevels[WeaponId.HolyCactus]).toBe(1);
    expect(state.weaponLevels[WeaponId.Sabra]).toBeUndefined();
  });
});
