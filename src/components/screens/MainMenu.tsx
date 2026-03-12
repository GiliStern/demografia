import { useRef } from "react";
import { styled } from "@linaria/react";

import { useSessionStore } from "@/store/sessionStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useProgressStore } from "@/store/progressStore";
import { UI_STRINGS } from "../../data/config/ui";
import { AppButton } from "../ui/AppButton";
import { banners, icons } from "@/assets/assetPaths";
import { useMenuNavigation } from "@/hooks/controls/useMenuNavigation";
import { Music, Volume2, VolumeOff, VolumeX } from "lucide-react";

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
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
  pointer-events: auto;

  @media (max-width: 768px) {
    gap: 24px;
    padding: 16px;
    justify-content: flex-start;
    padding-top: 40px;
  }

  @media (max-width: 480px) {
    gap: 20px;
    padding: 12px;
    padding-top: 30px;
  }
`;

const BannerImage = styled.img`
  width: 800px;
  height: auto;
  max-width: 100%;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 600px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const PausedText = styled.div`
  font-size: 32px;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 400px;
  max-width: 100%;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
    gap: 16px;
  }

  @media (max-width: 480px) {
    width: 100%;
    gap: 12px;
  }
`;

const VersionText = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #666;
  font-size: 14px;

  @media (max-width: 480px) {
    bottom: 10px;
    left: 10px;
    font-size: 12px;
  }
`;

const CoinDisplay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  color: #ffd700;

  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    font-size: 20px;
    gap: 6px;
  }
`;

const CoinIcon = styled.img`
  width: 32px;
  height: 32px;

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
  }
`;

export const MainMenu = ({ onShowCharacterSelection }: MainMenuProps) => {
  const resumeGame = useSessionStore((state) => state.resumeGame);
  const isPaused = useSessionStore((state) => state.isPaused);
  const isRunning = useSessionStore((state) => state.isRunning);
  const canResume = isRunning && isPaused;
  const coins = useProgressStore((state) => state.coins);
  const buttonColumnRef = useRef<HTMLDivElement>(null);
  const musicMuted = useSettingsStore((state) => state.musicMuted);
  const setMusicMuted = useSettingsStore((state) => state.setMusicMuted);
  const sfxMuted = useSettingsStore((state) => state.sfxMuted);
  const setSfxMuted = useSettingsStore((state) => state.setSfxMuted);

  const handleToggleMusic = () => {
    setMusicMuted(!musicMuted);
  };

  const handleToggleSfx = () => {
    setSfxMuted(!sfxMuted);
  };

  useMenuNavigation({
    containerRef: buttonColumnRef,
    isActive: true,
    focusKey: canResume,
  });

  return (
    <MenuContainer data-menu-container="true">
      <CoinDisplay>
        <CoinIcon src={icons.coin} alt="" aria-hidden />
        <span>{coins}</span>
      </CoinDisplay>
      {!canResume && (
        <BannerImage src={banners.main} alt={UI_STRINGS.menu.title} />
      )}

      {canResume && <PausedText>{UI_STRINGS.common.paused}</PausedText>}

      <ButtonColumn ref={buttonColumnRef}>
        {canResume && (
          <>
            <AppButton onClick={resumeGame}>
              {UI_STRINGS.common.resume}
            </AppButton>
            <AppButton onClick={handleToggleMusic} variant="compact">
              {musicMuted
                ? UI_STRINGS.common.unmute_music
                : UI_STRINGS.common.mute_music}
              {musicMuted ? <Music /> : <VolumeOff />}
            </AppButton>
            <AppButton onClick={handleToggleSfx} variant="compact">
              {sfxMuted
                ? UI_STRINGS.common.unmute_sfx
                : UI_STRINGS.common.mute_sfx}
              {sfxMuted ? <Volume2 /> : <VolumeX />}
            </AppButton>
          </>
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
        {UI_STRINGS.menu.version} {APP_VERSION}
      </VersionText>
    </MenuContainer>
  );
};
