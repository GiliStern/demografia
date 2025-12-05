import { GameCanvas } from "./components/GameCanvas";
import { InGameHUD } from "./components/InGameHUD";
import { MainMenu } from "./components/screens/MainMenu";
import { GameOver } from "./components/screens/GameOver";
import { useGameStore } from "./store/gameStore";
import "./App.css";

function App() {
  const { isRunning, isGameOver } = useGameStore();

  return (
    <div
      className="App"
      style={{ position: "relative", width: "100vw", height: "100vh" }}
    >
      {!isRunning && !isGameOver && <MainMenu />}
      {isGameOver && <GameOver />}
      <GameCanvas />
      {isRunning && !isGameOver && <InGameHUD />}
    </div>
  );
}

export default App;
