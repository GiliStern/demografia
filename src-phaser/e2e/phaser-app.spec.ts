import { test, expect, type Page } from "@playwright/test";

test.describe("Phaser App E2E", () => {
  const isSceneActive = async (page: Page, sceneKey: string) =>
    page.evaluate((key) => {
      const game = window.__PHASER_GAME__ as
        | { scene: { isActive: (name: string) => boolean } }
        | undefined;
      if (!game) return "missing_game";
      return game.scene.isActive(key) ? "active" : "inactive";
    }, sceneKey);

  test("loads boot and main menu", async ({ page }) => {
    await page.goto("/index-phaser.html");
    await expect(page.locator("canvas")).toBeVisible();
    await page.waitForTimeout(1000);
    const isMenuActive = await isSceneActive(page, "MainMenuScene");
    expect(isMenuActive).toBe("active");
  });

  test("can navigate to character selection", async ({ page }) => {
    await page.goto("/index-phaser.html");
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const game = window.__PHASER_GAME__ as { scene: { start: (name: string) => void } };
      game.scene.start("CharacterSelectionScene");
    });
    await page.waitForTimeout(200);
    const isCharacterSceneActive = await isSceneActive(page, "CharacterSelectionScene");
    expect(isCharacterSceneActive).toBe("active");
  });

  test("can start run and show HUD", async ({ page }) => {
    await page.goto("/index-phaser.html");
    await page.waitForTimeout(1000);
    await page.evaluate((characterId) => {
      const runtime = window.__PHASER_RUNTIME__ as {
        resetRuntime: () => void;
        game: { startGame: (id: string) => void };
      };
      const game = window.__PHASER_GAME__ as {
        scene: { start: (name: string) => void; run: (name: string) => void };
      };
      runtime.resetRuntime();
      runtime.game.startGame(characterId);
      game.scene.start("GameScene");
      game.scene.run("HudScene");
    }, "sruLik");
    await page.waitForTimeout(500);

    const gameActive = await isSceneActive(page, "GameScene");
    const hudActive = await isSceneActive(page, "HudScene");
    expect(gameActive).toBe("active");
    expect(hudActive).toBe("active");
  });
});
