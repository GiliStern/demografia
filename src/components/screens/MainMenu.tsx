import { useRef } from "react";
import styled from "@emotion/styled";

import { useGameStore } from "@/store/gameStore";
import { UI_STRINGS } from "../../data/config/ui";
import { AppButton } from "../ui/AppButton";
import { banners } from "@/assets/assetPaths";
import { useMenuNavigation } from "@/hooks/controls/useMenuNavigation";

interface MainMenuProps {
  onShowCharacterSelection: () => void;
}

const MenuContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: sans-serif;
  direction: rtl;
  z-index: 100;
`;

const BannerImage = styled.img`
  width: 800px;
  height: auto;
`;

const PausedText = styled.div`
  font-size: 32px;
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 400px;
`;

const VersionText = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #666;
`;

export const MainMenu = ({ onShowCharacterSelection }: MainMenuProps) => {
  const { resumeGame, isPaused, isRunning } = useGameStore();
  const canResume = isRunning && isPaused;
  const buttonColumnRef = useRef<HTMLDivElement>(null);

  useMenuNavigation({
    containerRef: buttonColumnRef,
    isActive: true,
    focusKey: canResume,
  });

  return (
    <MenuContainer>
      {!canResume && (
        <BannerImage
          src={banners.main}
          alt={UI_STRINGS.menu.title}
        />
      )}

      {canResume && (
        <PausedText>{UI_STRINGS.common.paused}</PausedText>
      )}

      <ButtonColumn ref={buttonColumnRef}>
        {canResume && (
          <AppButton onClick={resumeGame}>{UI_STRINGS.common.resume}</AppButton>
        )}

        {!canResume && (
          <AppButton onClick={onShowCharacterSelection}>
            {UI_STRINGS.menu.play}
          </AppButton>
        )}

        <AppButton disabled variant="disabled">
          {UI_STRINGS.menu.meta_shop} ({UI_STRINGS.common.locked})
        </AppButton>

        <AppButton disabled variant="disabled">
          {UI_STRINGS.menu.settings} ({UI_STRINGS.common.locked})
        </AppButton>
      </ButtonColumn>

      <VersionText>
        {UI_STRINGS.menu.version} 0.1.0
      </VersionText>
    </MenuContainer>
  );
};
