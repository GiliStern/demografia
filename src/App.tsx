import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { GameCanvas } from "./components/GameCanvas";
import { InGameHUD } from "./components/InGameHUD";
import { MainMenu } from "./components/screens/MainMenu";
import { GameOver } from "./components/screens/GameOver";
import { CharacterSelection } from "./components/screens/CharacterSelection";
import { TouchJoystick } from "./components/TouchJoystick";
import { useGameStore } from "@/store/gameStore";
import { useMobileDetection } from "./hooks/utils/useMobileDetection";
import { useTouchControls } from "./hooks/controls/useTouchControls";
import { PauseReason, CharacterId } from "./types";
import { GlobalStyles } from "./styles/GlobalStyles";

const AppContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const App = () => {
  const {
    isRunning,
    isGameOver,
    isPaused,
    pauseGame,
    resumeGame,
    pauseReason,
    startGame,
  } = useGameStore();
  
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const isMobile = useMobileDetection();
  
  // Disable touch controls when menus are visible
  const isMenuVisible = 
    showCharacterSelection ||
    (!showCharacterSelection &&
      !isGameOver &&
      (!isRunning || (isPaused && pauseReason === PauseReason.Manual))) ||
    isGameOver;
  
  const touchControls = useTouchControls(!isMenuVisible && isRunning && !isPaused && !isGameOver);
  const [touchInput, setTouchInput] = useState({ x: 0, y: 0 });

  // Update touch input state for TouchJoystick component
  useEffect(() => {
    const updateTouchInput = () => {
      setTouchInput(touchControls.current);
    };
    const interval = setInterval(updateTouchInput, 16); // 60fps
    return () => clearInterval(interval);
  }, [touchControls]);

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
  }, [isRunning, isGameOver, isPaused, pauseGame, resumeGame, showCharacterSelection]);

  return (
    <>
      <GlobalStyles />
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
            (!isRunning || (isPaused && pauseReason === PauseReason.Manual))) ||
          isGameOver
        }
      />
      {isRunning && !isPaused && !isGameOver && <InGameHUD />}
        {isRunning && !isPaused && !isGameOver && isMobile && (
          <TouchJoystick isVisible={true} touchInput={touchInput} />
        )}
      </AppContainer>
    </>
  );
};

export default App;
