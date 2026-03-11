import { useEffect, useState } from "react";
import { styled } from "@linaria/react";
import { GameCanvas } from "./components/GameCanvas";
import { InGameHUD } from "./components/InGameHUD";
import { MainMenu } from "./components/screens/MainMenu";
import { GameOver } from "./components/screens/GameOver";
import { CharacterSelection } from "./components/screens/CharacterSelection";
import { TouchJoystick } from "./components/TouchJoystick";
import { useSessionStore } from "@/store/sessionStore";
import { useMobileDetection } from "./hooks/utils/useMobileDetection";
import { useUnifiedControls } from "./hooks/controls/useUnifiedControls";
import { MovementInputProvider } from "./hooks/controls/MovementInputContext";
import { PauseReason, CharacterId } from "./types";
import "./styles/GlobalStyles";

const AppContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const App = () => {
  const isRunning = useSessionStore((state) => state.isRunning);
  const isGameOver = useSessionStore((state) => state.isGameOver);
  const isPaused = useSessionStore((state) => state.isPaused);
  const pauseGame = useSessionStore((state) => state.pauseGame);
  const resumeGame = useSessionStore((state) => state.resumeGame);
  const pauseReason = useSessionStore((state) => state.pauseReason);
  const startGame = useSessionStore((state) => state.startGame);

  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const isMobile = useMobileDetection();

  // Derived menu visibility - single source of truth
  const showMainMenu =
    !showCharacterSelection &&
    !isGameOver &&
    (!isRunning || (isPaused && pauseReason === PauseReason.Manual));
  const isMenuVisible = showCharacterSelection || showMainMenu || isGameOver;

  const movementInput = useUnifiedControls(
    !isMenuVisible && isRunning && !isPaused && !isGameOver,
  );

  const handleShowCharacterSelection = () => {
    setShowCharacterSelection(true);
  };

  const handleSelectCharacter = (characterId: CharacterId) => {
    setShowCharacterSelection(false);
    startGame(characterId);
  };

  const handleBackToMainMenu = () => {
    setShowCharacterSelection(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      // Close character selection if open
      if (showCharacterSelection) {
        setShowCharacterSelection(false);
        return;
      }

      if (!isRunning || isGameOver) return;

      if (isPaused) {
        resumeGame();
      } else {
        pauseGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isRunning,
    isGameOver,
    isPaused,
    pauseGame,
    resumeGame,
    showCharacterSelection,
  ]);

  return (
    <>
      <MovementInputProvider inputRef={movementInput.inputRef}>
        <AppContainer>
          {showCharacterSelection && (
            <CharacterSelection
              onSelectCharacter={handleSelectCharacter}
              onBack={handleBackToMainMenu}
            />
          )}
          {showMainMenu && (
            <MainMenu onShowCharacterSelection={handleShowCharacterSelection} />
          )}
          {isGameOver && <GameOver />}
          <GameCanvas $menuVisible={isMenuVisible} />
          {isRunning && !isPaused && !isGameOver && <InGameHUD />}
          {isRunning && !isPaused && !isGameOver && isMobile && (
            <TouchJoystick isVisible={true} touchInput={movementInput.touchInput} />
          )}
        </AppContainer>
      </MovementInputProvider>
    </>
  );
};

export default App;
