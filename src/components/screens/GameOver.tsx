import styled from "@emotion/styled";
import { useGameStore } from "@/store/gameStore";
import { UI_STRINGS } from "../../data/config/ui";
import { AppButton } from "../ui/AppButton";

const GameOverContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(50, 0, 0, 0.9);
  color: white;
  font-family: sans-serif;
  direction: rtl;
  z-index: 100;
`;

const GameOverTitle = styled.h1`
  font-size: 64px;
  margin-bottom: 20px;
  color: #ff4444;
`;

const StatsContainer = styled.div`
  font-size: 32px;
  margin-bottom: 40px;
  text-align: center;
`;

const StyledAppButton = styled(AppButton)`
  border: 2px solid white;
`;

export const GameOver = () => {
  const { runTimer, gold, killCount } = useGameStore();

  const minutes = Math.floor(runTimer / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(runTimer % 60)
    .toString()
    .padStart(2, "0");

  return (
    <GameOverContainer>
      <GameOverTitle>הפסדת!</GameOverTitle>

      <StatsContainer>
        <div>
          {UI_STRINGS.common.time}: {minutes}:{seconds}
        </div>
        <div>
          {UI_STRINGS.common.gold}: {gold}
        </div>
        <div>הריגות: {killCount}</div>
      </StatsContainer>

      <StyledAppButton
        onClick={() => window.location.reload()}
        variant="outline"
      >
        {UI_STRINGS.common.main_menu}
      </StyledAppButton>
    </GameOverContainer>
  );
};
