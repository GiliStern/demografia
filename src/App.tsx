import { useEffect } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { InGameHUD } from "./components/InGameHUD";
import { MainMenu } from "./components/screens/MainMenu";
import { GameOver } from "./components/screens/GameOver";
import { useGameStore } from "./hooks/useGameStore";
import { PauseReason } from "./types";
import "./App.css";

function App() {
  const {
    isRunning,
    isGameOver,
    isPaused,
    pauseGame,
    resumeGame,
    pauseReason,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!isRunning || isGameOver) return;

      if (isPaused) {
        resumeGame();
      } else {
        pauseGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isGameOver, isPaused, pauseGame, resumeGame]);

  return (
    <div
      className="App"
      style={{ position: "relative", width: "100vw", height: "100vh" }}
    >
      {!isGameOver &&
        (!isRunning || (isPaused && pauseReason === PauseReason.Manual)) && (
          <MainMenu />
        )}
      {isGameOver && <GameOver />}
      <GameCanvas />
      {isRunning && !isPaused && !isGameOver && <InGameHUD />}
    </div>
  );
}

export default App;
