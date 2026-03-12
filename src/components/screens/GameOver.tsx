import { styled } from "@linaria/react";
import { useSessionStore } from "@/store/sessionStore";
import { useProgressStore } from "@/store/progressStore";
import { UI_STRINGS } from "../../data/config/ui";
import { AppButton } from "../ui/AppButton";

const GameOverContainer = styled.div<{ $won?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ $won }) =>
    $won ? "rgba(0, 40, 20, 0.9)" : "rgba(50, 0, 0, 0.9)"};
  color: white;
  font-family: sans-serif;
  direction: rtl;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
  pointer-events: auto;

  @media (max-width: 768px) {
    padding: 16px;
    justify-content: flex-start;
    padding-top: 60px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    padding-top: 40px;
  }
`;

const GameOverTitle = styled.h1<{ $won?: boolean }>`
  font-size: 64px;
  margin-bottom: 20px;
  color: ${({ $won }) => ($won ? "#44ff88" : "#ff4444")};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 36px;
    margin-bottom: 12px;
  }
`;

const SuccessMessage = styled.p`
  font-size: 24px;
  margin-bottom: 20px;
  color: #aaffcc;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

const NewHighScoreBadge = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #ffdd44;
  text-align: center;
  animation: pulse 1s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const StatsContainer = styled.div`
  font-size: 32px;
  margin-bottom: 24px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const HighScoreTable = styled.div`
  font-size: 18px;
  margin-bottom: 24px;
  text-align: center;
  min-width: 200px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

const HighScoreHeader = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  opacity: 0.9;
`;

const HighScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 4px 0;
  opacity: 0.85;
`;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export const GameOver = () => {
  const runTimer = useSessionStore((state) => state.runTimer);
  const gold = useSessionStore((state) => state.gold);
  const killCount = useSessionStore((state) => state.killCount);
  const gameWon = useSessionStore((state) => state.gameWon);
  const newHighScore = useSessionStore((state) => state.newHighScore);
  const highScores = useProgressStore((state) => state.highScores);

  const minutes = Math.floor(runTimer / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(runTimer % 60)
    .toString()
    .padStart(2, "0");

  return (
    <GameOverContainer data-menu-container="true" $won={gameWon}>
      <GameOverTitle $won={gameWon}>
        {gameWon ? UI_STRINGS.game_over.you_won : UI_STRINGS.game_over.you_lost}
      </GameOverTitle>

      {gameWon && (
        <SuccessMessage>{UI_STRINGS.game_over.waves_complete}</SuccessMessage>
      )}

      {newHighScore && (
        <NewHighScoreBadge>
          {UI_STRINGS.game_over.new_highscore}
        </NewHighScoreBadge>
      )}

      <StatsContainer>
        <div>
          {UI_STRINGS.common.time}: {minutes}:{seconds}
        </div>
        <div>
          {UI_STRINGS.common.gold}: {gold}
        </div>
        <div>
          {UI_STRINGS.game_over.kills}: {killCount}
        </div>
      </StatsContainer>

      {highScores.length > 0 && (
        <HighScoreTable>
          <HighScoreHeader>
            {UI_STRINGS.game_over.highscore_table}
          </HighScoreHeader>
          {highScores.map((entry, i) => (
            <HighScoreRow key={`${entry.time}-${entry.killCount}-${i}`}>
              <span>
                {i + 1}. {formatTime(entry.time)}
              </span>
              <span>
                {UI_STRINGS.game_over.kills}: {entry.killCount} |{" "}
                {UI_STRINGS.common.gold}: {entry.gold}
              </span>
            </HighScoreRow>
          ))}
        </HighScoreTable>
      )}

      <AppButton
        onClick={() => useSessionStore.getState().resetToMainMenu()}
        variant="outline"
      >
        {UI_STRINGS.common.main_menu}
      </AppButton>
    </GameOverContainer>
  );
};
