import { describe, expect, it } from "vitest";
import { CharacterId, ItemKind, PauseReason, WeaponId } from "@/types";
import { PhaserGameState } from "./PhaserGameState";

describe("PhaserGameState", () => {
  it("starts game with selected character and base weapon", () => {
    const state = new PhaserGameState();
    state.startGame(CharacterId.Srulik);

    expect(state.isRunning).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.player.characterId).toBe(CharacterId.Srulik);
    expect(state.activeWeapons.includes(WeaponId.Sabra)).toBe(true);
  });

  it("levels up and pauses with generated choices", () => {
    const state = new PhaserGameState();
    state.startGame(CharacterId.Srulik);
    state.addXp(1000);

    expect(state.level).toBeGreaterThan(1);
    expect(state.pauseReason).toBe(PauseReason.LevelUp);
    expect(state.upgradeChoices.length).toBeGreaterThan(0);
  });

  it("applies weapon upgrade and resumes from level-up", () => {
    const state = new PhaserGameState();
    state.startGame(CharacterId.Srulik);
    state.forceLevelUpForTests([
      {
        kind: ItemKind.Weapon,
        weaponId: WeaponId.StarOfDavid,
        isNew: true,
        currentLevel: 0,
      },
    ]);

    state.applyUpgrade(state.upgradeChoices[0]!);

    expect(state.activeWeapons.includes(WeaponId.StarOfDavid)).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.pauseReason).toBe(PauseReason.None);
  });

  it("ends game when health reaches zero", () => {
    const state = new PhaserGameState();
    state.startGame(CharacterId.Srulik);
    state.takeDamage(9999);

    expect(state.isGameOver).toBe(true);
    expect(state.isRunning).toBe(false);
  });
});
