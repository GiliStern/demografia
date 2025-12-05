// Screen management system

class ScreenManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.uiManager = new UIManager();
    this.currentScreen = null;
    this.screenHistory = [];

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation events
    window.addEventListener("navigateToScreen", (e) => {
      this.loadScreen(e.detail.screenId);
    });

    // Game start event
    window.addEventListener("startGame", (e) => {
      this.startGame();
    });

    // Shop events
    window.addEventListener("buyShopItem", (e) => {
      this.handleShopPurchase(e.detail.itemId, e.detail.cost);
    });

    // Virtual action events for mobile
    window.addEventListener("virtualAction", (e) => {
      this.handleVirtualAction(e.detail.action);
    });
  }

  async initialize() {
    // Load initial screen
    await this.loadScreen("splash");
  }

  async loadScreen(screenId, data = {}) {
    // Add current screen to history if different
    if (this.currentScreen && this.currentScreen !== screenId) {
      this.screenHistory.push(this.currentScreen);
      // Limit history size
      if (this.screenHistory.length > 10) {
        this.screenHistory.shift();
      }
    }

    this.currentScreen = screenId;
    this.gameState.currentScreen = screenId;

    // Prepare screen data
    const screenData = this.prepareScreenData(screenId, data);

    // Load screen UI
    await this.uiManager.loadScreen(screenId, screenData);

    // Handle screen-specific logic
    this.handleScreenLoad(screenId, screenData);

    // Play appropriate music
    this.updateMusic(screenId);

    console.log("Screen loaded:", screenId);
  }

  prepareScreenData(screenId, additionalData = {}) {
    const playerData = saveSystem.getPlayerData();

    const baseData = {
      ...playerData,
      selectedCharacter: this.gameState.selectedCharacter,
      selectedStage: this.gameState.selectedStage,
      ...additionalData,
    };

    switch (screenId) {
      case "character_select":
        return {
          ...baseData,
          availableCharacters: this.getAvailableCharacters(),
        };

      case "stage_select":
        return {
          ...baseData,
          availableStages: this.getAvailableStages(),
          selectedStageIndex: this.getStageIndex(this.gameState.selectedStage),
        };

      case "meta_shop":
        return {
          ...baseData,
          shopItems: this.getShopItemsWithPrices(),
        };

      case "achievements":
        return {
          ...baseData,
          achievementList: this.getAchievementsWithStatus(),
        };

      default:
        return baseData;
    }
  }

  getAvailableCharacters() {
    const allCharacters = getCharacters();
    const unlockedIds = saveSystem.progress.characters.unlocked;

    return allCharacters.map((char) => ({
      ...char,
      unlocked: unlockedIds.includes(char.id),
    }));
  }

  getAvailableStages() {
    const allStages = getStages();
    const unlockedIds = saveSystem.progress.stages.unlocked;

    return allStages.map((stage) => ({
      ...stage,
      unlocked: unlockedIds.includes(stage.id),
      bestTime: saveSystem.progress.stages.bestTimes[stage.id],
      highScore: saveSystem.progress.stages.highScores[stage.id],
    }));
  }

  getStageIndex(stageId) {
    const stages = getStages();
    return Math.max(
      0,
      stages.findIndex((s) => s.id === stageId)
    );
  }

  getShopItemsWithPrices() {
    const shopItems = getMetaShop();

    return shopItems.map((item) => {
      const currentLevel = saveSystem.getMetaUpgradeLevel(item.id);
      const baseCost = 100; // Default base cost
      const cost = Math.floor(baseCost * Math.pow(1.5, currentLevel));

      return {
        ...item,
        currentLevel,
        cost,
        affordable: saveSystem.progress.player.gold >= cost,
        maxLevel: 10, // Default max level
      };
    });
  }

  getAchievementsWithStatus() {
    const allAchievements = getAchievements();
    const unlockedIds = saveSystem.progress.achievements.unlocked;

    return allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      progress: this.getAchievementProgress(achievement.id),
    }));
  }

  getAchievementProgress(achievementId) {
    // Return progress for progressive achievements
    const progress = saveSystem.progress.achievements.progress[achievementId];
    return progress || 0;
  }

  handleScreenLoad(screenId, data) {
    switch (screenId) {
      case "splash":
        this.handleSplashScreen();
        break;

      case "main_menu":
        this.handleMainMenu();
        break;

      case "character_select":
        this.handleCharacterSelect();
        break;

      case "stage_select":
        this.handleStageSelect();
        break;

      case "settings":
        this.handleSettings();
        break;

      case "meta_shop":
        this.handleMetaShop();
        break;

      case "achievements":
        this.handleAchievements();
        break;
    }
  }

  handleSplashScreen() {
    // Auto-transition after showing splash
    setTimeout(() => {
      // Check for any user interaction
      const handleFirstInteraction = () => {
        this.loadScreen("main_menu");
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
      };

      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("keydown", handleFirstInteraction);
      document.addEventListener("touchstart", handleFirstInteraction);
    }, 1000);
  }

  handleMainMenu() {
    // Ensure audio is initialized
    const audioManager = getAudioManager();
    if (audioManager) {
      // Resume audio context if suspended
      audioManager.resumeAudioContext();
    }
  }

  handleCharacterSelect() {
    // Pre-select first available character if none selected
    if (!this.gameState.selectedCharacter) {
      const availableCharacters = this.getAvailableCharacters();
      const firstUnlocked = availableCharacters.find((char) => char.unlocked);
      if (firstUnlocked) {
        this.gameState.selectedCharacter = firstUnlocked.id;
      }
    }
  }

  handleStageSelect() {
    // Pre-select first available stage if none selected
    if (!this.gameState.selectedStage) {
      const availableStages = this.getAvailableStages();
      const firstUnlocked = availableStages.find((stage) => stage.unlocked);
      if (firstUnlocked) {
        this.gameState.selectedStage = firstUnlocked.id;
      }
    }
  }

  handleSettings() {
    // Apply current settings to UI
    this.applyCurrentSettings();
  }

  applyCurrentSettings() {
    // This would update sliders and toggles to match current settings
    const settings = saveSystem.settings;

    // Update audio volumes
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.setMusicVolume(settings.music_volume / 100);
      audioManager.setSFXVolume(settings.sfx_volume / 100);
    }
  }

  handleMetaShop() {
    // Update shop display with current gold
    this.updateShopAffordability();
  }

  updateShopAffordability() {
    const shopItems = document.querySelectorAll(".shop-item");
    const playerGold = saveSystem.progress.player.gold;

    shopItems.forEach((item) => {
      const costElement = item.querySelector("[data-cost]");
      if (costElement) {
        const cost = parseInt(costElement.getAttribute("data-cost"));
        if (playerGold >= cost) {
          item.classList.add("affordable");
        } else {
          item.classList.remove("affordable");
        }
      }
    });
  }

  handleAchievements() {
    // Update achievement progress displays
    this.updateAchievementProgress();
  }

  updateAchievementProgress() {
    // Update achievement items with current progress
    const achievementItems = document.querySelectorAll(".achievement-item");

    achievementItems.forEach((item) => {
      const achievementId = item.getAttribute("data-achievement-id");
      if (achievementId) {
        const progress = this.getAchievementProgress(achievementId);
        const progressElement = item.querySelector(".achievement-progress");
        if (progressElement) {
          progressElement.textContent = `${progress}%`;
        }
      }
    });
  }

  handleShopPurchase(itemId, cost) {
    const success = saveSystem.buyMetaUpgrade(itemId, cost);

    if (success) {
      // Play purchase sound
      const audioManager = getAudioManager();
      if (audioManager) {
        audioManager.playPowerup();
      }

      // Update display
      this.updateShopAffordability();

      // Show purchase feedback
      this.showPurchaseSuccess(itemId);

      console.log("Purchased upgrade:", itemId);
    } else {
      // Show insufficient funds message
      this.showPurchaseFailure();

      // Play error sound
      const audioManager = getAudioManager();
      if (audioManager) {
        audioManager.playButtonClick();
      }
    }
  }

  showPurchaseSuccess(itemId) {
    const notification = document.createElement("div");
    notification.className = "purchase-notification success";
    notification.textContent = `${getText("ui_strings.common.buy")} ✓`;

    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(39, 174, 96, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease-out;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  showPurchaseFailure() {
    const notification = document.createElement("div");
    notification.className = "purchase-notification failure";
    notification.textContent = "Not enough gold!";

    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease-out;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  handleVirtualAction(action) {
    switch (action) {
      case "pause":
        if (this.currentScreen === "gameplay") {
          this.pauseGame();
        } else {
          this.goBack();
        }
        break;

      default:
        console.log("Unhandled virtual action:", action);
    }
  }

  startGame() {
    if (!this.gameState.selectedCharacter || !this.gameState.selectedStage) {
      console.error("Cannot start game: missing character or stage selection");
      return;
    }

    // Initialize game session
    saveSystem.startGameSession(
      this.gameState.selectedCharacter,
      this.gameState.selectedStage
    );

    // Transition to gameplay
    this.gameState.isInGameplay = true;
    this.gameState.currentScreen = "gameplay";

    // Clear UI and start game
    this.uiManager.clearScreen();

    // Initialize game engine
    if (window.gameEngine) {
      window.gameEngine.startGame(
        this.gameState.selectedCharacter,
        this.gameState.selectedStage
      );
    }

    console.log(
      "Starting game:",
      this.gameState.selectedCharacter,
      this.gameState.selectedStage
    );
  }

  pauseGame() {
    if (this.gameState.isInGameplay) {
      this.gameState.isPaused = !this.gameState.isPaused;

      if (this.gameState.isPaused) {
        // Pause the game loop
        if (window.gameEngine) {
          window.gameEngine.pauseGame();
        }
        this.showPauseMenu();
      } else {
        this.hidePauseMenu();
        // Resume the game loop
        if (window.gameEngine) {
          window.gameEngine.resumeGame();
        }
      }
    }
  }

  showPauseMenu() {
    const pauseMenu = document.createElement("div");
    pauseMenu.id = "pauseMenu";
    pauseMenu.className = "pause-menu";

    // Title with fallback if key missing
    const titleKey = getText("ui_strings.common.pause");
    const titleText =
      titleKey === "ui_strings.common.pause" ? "הפסקה" : titleKey;

    pauseMenu.innerHTML = `
      <div class="pause-backdrop"></div>
      <div class="pause-content">
        <div class="pause-header">
          <h2 class="pause-title">${titleText}</h2>
          <div class="pause-subtitle">${TimeUtils.formatTime(
            window.gameEngine?.gameTime || 0
          )}</div>
        </div>
        <div class="pause-actions">
          <button class="ui-button" onclick="screenManager.pauseGame()">${getText(
            "ui_strings.common.resume"
          )}</button>
          <button class="ui-button" onclick="screenManager.restartGame()">${getText(
            "ui_strings.common.restart"
          )}</button>
          <button class="ui-button" onclick="screenManager.exitToMenu()">${getText(
            "ui_strings.common.main_menu"
          )}</button>
        </div>
      </div>`;

    document.body.appendChild(pauseMenu);
  }

  hidePauseMenu() {
    const pauseMenu = document.getElementById("pauseMenu");
    if (pauseMenu) {
      pauseMenu.parentNode.removeChild(pauseMenu);
    }
  }

  restartGame() {
    this.hidePauseMenu();
    this.startGame();
  }

  exitToMenu() {
    this.hidePauseMenu();
    this.endGame(false);
    this.loadScreen("main_menu");
  }

  endGame(victory = false, stats = {}) {
    this.gameState.isInGameplay = false;
    this.gameState.isPaused = false;

    // Stop game engine
    if (window.gameEngine) {
      window.gameEngine.endGame(victory);
    }

    // End game session
    saveSystem.endGameSession({
      victory,
      ...stats,
    });

    // Clear game UI
    this.uiManager.clearHUD();

    // Show game over or results
    if (victory) {
      this.showGameResults(true, stats);
    } else {
      this.showGameOver(stats);
    }

    console.log("Game ended:", victory ? "Victory" : "Defeat");
  }

  showGameOver(stats = {}) {
    // Play menu music
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playMenuMusic();
    }

    // Build overlay
    const overlay = document.createElement("div");
    overlay.className = "game-results"; // reuse styling
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex; justify-content: center; align-items: center;
      z-index: 10000; color: white; text-align: center;`;

    const survivalTime = TimeUtils.formatTime(stats.survivalTime || 0);
    overlay.innerHTML = `
      <div class="results-content">
        <h1>Game Over</h1>
        <div class="results-stats" style="margin: 10px 0 20px; opacity: 0.9;">
          <p>Survival Time: ${survivalTime}</p>
          <p>Enemies Defeated: ${stats.enemiesKilled || 0}</p>
          <p>Gold Earned: ${stats.goldEarned || 0}</p>
          <p>Experience Gained: ${stats.experienceGained || 0}</p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button id="btnRetry" class="ui-button" style="min-width: 160px;">${getText(
            "ui_strings.common.restart"
          )}</button>
          <button id="btnChar" class="ui-button" style="min-width: 160px;">${getText(
            "ui_strings.character_select.title"
          )}</button>
          <button id="btnMenu" class="ui-button" style="min-width: 160px;">${getText(
            "ui_strings.common.main_menu"
          )}</button>
        </div>
      </div>`;

    // Wire actions
    overlay.querySelector("#btnRetry").addEventListener("click", () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      this.restartGame();
    });

    overlay.querySelector("#btnChar").addEventListener("click", () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      this.loadScreen("character_select");
    });

    overlay.querySelector("#btnMenu").addEventListener("click", () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      this.loadScreen("main_menu");
    });

    document.body.appendChild(overlay);
  }

  showGameResults(victory, stats) {
    const resultsScreen = document.createElement("div");
    resultsScreen.className = "game-results";

    const title = victory ? "Victory!" : "Game Over";
    const survivalTime = TimeUtils.formatTime(stats.survivalTime || 0);

    resultsScreen.innerHTML = `
            <div class="results-content">
                <h1>${title}</h1>
                <div class="results-stats">
                    <p>Survival Time: ${survivalTime}</p>
                    <p>Enemies Defeated: ${stats.enemiesKilled || 0}</p>
                    <p>Gold Earned: ${stats.goldEarned || 0}</p>
                    <p>Experience Gained: ${stats.experienceGained || 0}</p>
                </div>
                <button class="ui-button" onclick="screenManager.loadScreen('main_menu')">Continue</button>
            </div>
        `;

    resultsScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            text-align: center;
        `;

    document.body.appendChild(resultsScreen);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (resultsScreen.parentNode) {
        resultsScreen.parentNode.removeChild(resultsScreen);
        this.loadScreen("main_menu");
      }
    }, 10000);
  }

  goBack() {
    if (this.screenHistory.length > 0) {
      const previousScreen = this.screenHistory.pop();
      this.loadScreen(previousScreen);
    } else {
      this.loadScreen("main_menu");
    }
  }

  updateMusic(screenId) {
    const audioManager = getAudioManager();
    if (!audioManager) return;

    switch (screenId) {
      case "splash":
      case "main_menu":
      case "character_select":
      case "stage_select":
      case "settings":
      case "meta_shop":
      case "achievements":
        audioManager.playMenuMusic();
        break;

      case "gameplay":
        audioManager.playGameplayMusic();
        break;

      default:
        // Keep current music
        break;
    }
  }

  // Update method called each frame
  update(deltaTime) {
    // Update UI animations
    TweenManager.update(deltaTime);

    // Update screen-specific logic
    if (this.currentScreen === "gameplay" && !this.gameState.isPaused) {
      // Gameplay updates handled by game engine
    }
  }

  // Clean up
  destroy() {
    this.uiManager.clearScreen();
    this.hidePauseMenu();

    const gameResults = document.querySelector(".game-results");
    if (gameResults) {
      gameResults.parentNode.removeChild(gameResults);
    }
  }
}

// Export screen manager
window.ScreenManager = ScreenManager;
