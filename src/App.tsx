import { useEffect, useState } from "react";
import { styled } from "@linaria/react";
import { GameCanvas } from "./components/GameCanvas";
import { InGameHUD } from "./components/InGameHUD";
import { MainMenu } from "./components/screens/MainMenu";
import { GameOver } from "./components/screens/GameOver";
import { CharacterSelection } from "./components/screens/CharacterSelection";
import { TouchJoystick } from "./components/TouchJoystick";
import { useGameStore } from "@/store/gameStore";
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
  const isRunning = useGameStore((state) => state.isRunning);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const isPaused = useGameStore((state) => state.isPaused);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const pauseReason = useGameStore((state) => state.pauseReason);
  const startGame = useGameStore((state) => state.startGame);

  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const isMobile = useMobileDetection();

  // Disable touch controls when menus are visible
  const isMenuVisible =
    showCharacterSelection ||
    (!showCharacterSelection &&
      !isGameOver &&
      (!isRunning || (isPaused && pauseReason === PauseReason.Manual))) ||
    isGameOver;

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
          {!showCharacterSelection &&
            !isGameOver &&
            (!isRunning || (isPaused && pauseReason === PauseReason.Manual)) && (
              <MainMenu onShowCharacterSelection={handleShowCharacterSelection} />
            )}
          {isGameOver && <GameOver />}
          <GameCanvas
            $menuVisible={
              showCharacterSelection ||
              (!showCharacterSelection &&
                !isGameOver &&
                (!isRunning ||
                  (isPaused && pauseReason === PauseReason.Manual))) ||
              isGameOver
            }
          />
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
