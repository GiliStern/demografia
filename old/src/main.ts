import '../style.css';
import './polyfills';
import './modules';

declare global {
  interface Window {
    GameEngine: any;
    ScreenManager: any;
    gameEngine: any;
    screenManager: any;
    gameState: any;
    loadGameConfig: () => Promise<any>;
  }
}

async function bootstrap(): Promise<void> {
  try {
    // Load game config JSON first
    await window.loadGameConfig();

    // Canvas and UI roots
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
    if (!canvas) throw new Error('Canvas element not found');

    // Input setup (global for engine and entities)
    const inputManager = new (window as any).InputManager();
    const touchControls = new (window as any).TouchControls(canvas);

    (window as any).game = {
      inputManager,
      touchControls,
    };

    // Create engine
    const engine = new window.GameEngine(canvas);
    window.gameEngine = engine;

    // Minimal game state for screens
    const gameState = {
      currentScreen: 'splash',
      selectedCharacter: null as string | null,
      selectedStage: null as string | null,
      isInGameplay: false,
      isPaused: false,
    };
    window.gameState = gameState;

    // Screen manager
    const screenManager = new window.ScreenManager(gameState);
    window.screenManager = screenManager;
    await screenManager.initialize();

    // Hide loading screen
    const loading = document.getElementById('loadingScreen');
    if (loading && loading.parentNode) loading.parentNode.removeChild(loading);

    // Resize handler (keeps canvas crisp)
    const handleResize = () => {
      // Canvas render size is fixed; CSS scales it
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };
    window.addEventListener('resize', handleResize);
    handleResize();
  } catch (err) {
    console.error('Bootstrap failed:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  void bootstrap();
}
