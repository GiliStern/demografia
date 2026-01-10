import { useEffect, useState } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { InGameHUD } from "./components/InGameHUD";
import { MainMenu } from "./components/screens/MainMenu";
import { GameOver } from "./components/screens/GameOver";
import { CharacterSelection } from "./components/screens/CharacterSelection";
import { useGameStore } from "@/store/gameStore";
import { PauseReason, CharacterId } from "./types";
import "./App.css";

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
    <div
      className="App"
      style={{ position: "relative", width: "100vw", height: "100vh" }}
    >
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
      <GameCanvas />
      {isRunning && !isPaused && !isGameOver && <InGameHUD />}
    </div>
  );
};

export default App;
