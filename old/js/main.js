// Main game entry point and controller

class Game {
  constructor() {
    this.canvas = null;
    this.gameEngine = null;
    this.screenManager = null;
    this.inputManager = null;
    this.touchControls = null;
    this.initialized = false;
    this.loading = true;

    // Game state
    this.gameState = {
      currentScreen: "loading",
      selectedCharacter: null,
      selectedStage: null,
      isInGameplay: false,
      isPaused: false,
      player: null,
    };

    // Loading progress
    this.loadingProgress = 0;
    this.loadingSteps = [
      "Loading configuration...",
      "Initializing audio...",
      "Generating sprites...",
      "Setting up UI...",
      "Ready!",
    ];
    this.currentLoadingStep = 0;
  }

  async initialize() {
    try {
      console.log("Initializing Hebrew Vampire Survivors...");

      // Show loading screen
      this.showLoadingScreen();

      // Load game configuration
      await this.loadConfiguration();

      // Initialize canvas
      this.initializeCanvas();

      // Initialize audio
      await this.initializeAudio();

      // Initialize input
      this.initializeInput();

      // Initialize systems
      this.initializeSystems();

      // Initialize screens
      await this.initializeScreens();

      // Hide loading screen
      this.hideLoadingScreen();

      // Start the game
      this.start();

      this.initialized = true;
      console.log("Game initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.showError("Failed to load game. Please refresh and try again.");
    }
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }
  }

  updateLoadingProgress(step, progress = 0) {
    this.currentLoadingStep = step;
    this.loadingProgress = (step / this.loadingSteps.length) * 100 + progress;

    const progressBar = document.querySelector(".loading-progress");
    const loadingText = document.querySelector(".loading-content h2");

    if (progressBar) {
      progressBar.style.width = `${this.loadingProgress}%`;
    }

    if (loadingText && this.loadingSteps[step]) {
      loadingText.textContent = this.loadingSteps[step];
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
  }

  async loadConfiguration() {
    this.updateLoadingProgress(0);

    try {
      await loadGameConfig();
      console.log("Configuration loaded");
    } catch (error) {
      throw new Error("Failed to load game configuration: " + error.message);
    }
  }

  initializeCanvas() {
    this.canvas = document.getElementById("gameCanvas");
    if (!this.canvas) {
      throw new Error("Game canvas not found");
    }

    // Set up canvas for pixel art
    const ctx = this.canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    console.log("Canvas initialized");
  }

  async initializeAudio() {
    this.updateLoadingProgress(1);

    // Initialize procedural sound generator
    try {
      if (window.initializeSoundGenerator) {
        window.initializeSoundGenerator();
        console.log("Procedural sound generator initialized");
      }
    } catch (error) {
      console.warn("Sound generator initialization failed:", error);
    }

    // Audio is initialized on first user interaction
    // This just sets up the framework
    console.log("Audio system ready");
  }

  initializeInput() {
    this.inputManager = new InputManager();

    // Set up touch controls for mobile
    this.touchControls = new TouchControls(this.canvas);

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();

    console.log("Input system initialized");
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "Escape":
          e.preventDefault();
          if (this.gameState.isInGameplay) {
            this.screenManager.pauseGame();
          } else if (this.gameState.currentScreen !== "main_menu") {
            this.screenManager.goBack();
          }
          break;

        case "F1":
          e.preventDefault();
          this.toggleDebug();
          break;

        case "KeyM":
          if (e.ctrlKey) {
            e.preventDefault();
            this.toggleMute();
          }
          break;
      }
    });
  }

  initializeSystems() {
    this.updateLoadingProgress(2);

    // Initialize game engine
    this.gameEngine = new GameEngine(this.canvas);

    // Make game state globally accessible
    window.gameState = this.gameState;
    window.gameEngine = this.gameEngine;

    console.log("Game systems initialized");
  }

  async initializeScreens() {
    this.updateLoadingProgress(3);

    // Initialize screen manager
    this.screenManager = new ScreenManager(this.gameState);
    window.screenManager = this.screenManager;

    // Wait for sprites to be generated
    await this.waitForSprites();

    console.log("Screen system initialized");
  }

  async waitForSprites() {
    // Give sprite manager time to generate placeholders
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  async start() {
    this.updateLoadingProgress(4);

    // Initialize screen manager
    await this.screenManager.initialize();

    // Start main game loop for non-gameplay updates
    this.startMainLoop();

    console.log("Game started");
  }

  startMainLoop() {
    const mainLoop = () => {
      try {
        // Update time utilities
        TimeUtils.update();

        // Update input
        if (this.inputManager) {
          this.inputManager.update();
        }

        // Update screen manager
        if (this.screenManager) {
          this.screenManager.update(TimeUtils.deltaTime);
        }

        // Update tween manager
        TweenManager.update(TimeUtils.deltaTime);

        // Update performance tracking
        Performance.update(TimeUtils.deltaTime);

        // Update debug display
        if (Debug.enabled) {
          Debug.updateDisplay(this.gameState);
        }

        // Render touch controls if needed
        if (this.touchControls && this.touchControls.enabled) {
          const ctx = this.canvas.getContext("2d");
          this.touchControls.render(ctx);
        }
      } catch (error) {
        console.error("Error in main loop:", error);
      }

      requestAnimationFrame(mainLoop);
    };

    requestAnimationFrame(mainLoop);
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `
            <div class="error-content">
                <h2>Error</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()">Reload Game</button>
            </div>
        `;

    errorDiv.style.cssText = `
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

    document.body.appendChild(errorDiv);
  }

  toggleDebug() {
    Debug.toggle();
    console.log("Debug mode:", Debug.enabled ? "ON" : "OFF");
  }

  toggleMute() {
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.toggleMute();
      console.log("Audio:", audioManager.settings.muted ? "MUTED" : "UNMUTED");
    }
  }

  // Handle window resize
  handleResize() {
    if (!this.canvas) return;

    // Update canvas size based on window size while maintaining aspect ratio
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();

    const targetAspectRatio =
      GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.CANVAS_HEIGHT;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let newWidth, newHeight;

    if (containerAspectRatio > targetAspectRatio) {
      // Container is wider than target aspect ratio
      newHeight = containerRect.height;
      newWidth = newHeight * targetAspectRatio;
    } else {
      // Container is taller than target aspect ratio
      newWidth = containerRect.width;
      newHeight = newWidth / targetAspectRatio;
    }

    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;
  }

  // Handle visibility change (tab switching)
  handleVisibilityChange() {
    if (document.hidden) {
      // Game tab is hidden - pause if in gameplay
      if (this.gameState.isInGameplay && !this.gameState.isPaused) {
        this.screenManager.pauseGame();
      }

      // Mute audio
      const audioManager = getAudioManager();
      if (audioManager && !audioManager.settings.muted) {
        audioManager.mute();
        this.wasAutoMuted = true;
      }
    } else {
      // Game tab is visible again - unmute if we auto-muted
      if (this.wasAutoMuted) {
        const audioManager = getAudioManager();
        if (audioManager) {
          audioManager.unmute();
        }
        this.wasAutoMuted = false;
      }
    }
  }

  // Cleanup when page is unloaded
  cleanup() {
    console.log("Cleaning up game...");

    // Save game state
    if (window.saveSystem) {
      saveSystem.saveAll();
    }

    // Stop game engine
    if (this.gameEngine) {
      this.gameEngine.running = false;
    }

    // Cleanup audio
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.destroy();
    }

    // Cleanup screen manager
    if (this.screenManager) {
      this.screenManager.destroy();
    }
  }
}

// Initialize and start the game when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing game...");

  // Create global game instance
  window.game = new Game();

  // Set up event handlers
  window.addEventListener("resize", () => window.game.handleResize());
  document.addEventListener("visibilitychange", () =>
    window.game.handleVisibilityChange()
  );
  window.addEventListener("beforeunload", () => window.game.cleanup());

  // Handle orientation changes on mobile
  window.addEventListener("orientationchange", () => {
    setTimeout(() => window.game.handleResize(), 500);
  });

  // Initialize the game
  try {
    await window.game.initialize();
  } catch (error) {
    console.error("Failed to initialize game:", error);
  }
});

// Handle any uncaught errors
window.addEventListener("error", (e) => {
  console.error("Uncaught error:", e.error);

  // Show user-friendly error message
  if (window.game && !window.game.initialized) {
    window.game.showError(
      "An error occurred while loading the game. Please refresh the page."
    );
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
  e.preventDefault(); // Prevent default browser error handling
});

// Export game class
window.Game = Game;

// Add some helpful debug functions to the global scope
window.gameDebug = {
  addGold: (amount) => {
    if (window.game && window.game.gameState.player) {
      window.game.gameState.player.gainGold(amount);
    }
  },

  addXP: (amount) => {
    if (window.game && window.game.gameState.player) {
      window.game.gameState.player.gainXP(amount);
    }
  },

  spawnEnemies: (count = 10) => {
    if (window.gameEngine && window.gameEngine.spawner) {
      for (let i = 0; i < count; i++) {
        window.gameEngine.spawner.spawnEnemy(
          window.gameEngine.player.x,
          window.gameEngine.player.y
        );
      }
    }
  },

  toggleInvincibility: () => {
    if (window.game && window.game.gameState.player) {
      window.game.gameState.player.setInvulnerable(999);
      console.log("Player is now invincible");
    }
  },

  goto: (screen) => {
    if (window.screenManager) {
      window.screenManager.loadScreen(screen);
    }
  },
};

console.log(
  "Main game controller loaded. Use gameDebug for testing functions."
);
console.log("Available debug functions:", Object.keys(window.gameDebug));
