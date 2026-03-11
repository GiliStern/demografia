import { styled } from "@linaria/react";
import { Pause } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useSessionStore } from "@/store/sessionStore";
import { useWeaponsStore } from "@/store/weaponsStore";
import { UI_STRINGS } from "../data/config/ui";
import { getWeapon } from "../data/config/weaponsNormalized";
import { WeaponId } from "@/types";

const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  font-family: sans-serif;
  color: white;
  padding: 20px;
  box-sizing: border-box;
  direction: rtl;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
  }
`;

const PauseButton = styled.button`
  display: none;
  order: 3;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid white;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: flex;
    order: 1;
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LevelSection = styled.div`
  width: 30%;
  order: 1;

  @media (max-width: 768px) {
    width: auto;
    min-width: 0;
    order: 3;
  }
`;

const LevelText = styled.div`
  font-size: 24px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const XPBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background: #444;
  border: 2px solid white;
  margin-top: 5px;
`;

const XPBarFill = styled.div<{ percent: number }>`
  width: ${({ percent }) => `${percent}%`};
  height: 100%;
  background: #4f4;
  transition: width 0.2s;
`;

const TimerWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  order: 2;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Timer = styled.div`
  font-size: 32px;
  font-weight: bold;
  font-family: monospace;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const HealthBarContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: calc(100% - 40px);
  height: 20px;
  background: #444;
  border: 2px solid white;

  @media (max-width: 768px) {
    width: 280px;
    bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 480px) {
    width: 240px;
    bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  }
`;

const HealthBarFill = styled.div<{ percent: number }>`
  width: ${({ percent }) => `${percent}%`};
  height: 100%;
  background: #f44;
  transition: width 0.2s;
`;

const HealthText = styled.div`
  position: absolute;
  top: -25px;
  width: 100%;
  text-align: center;
  font-weight: bold;
`;

const WeaponsList = styled.div`
  position: absolute;
  top: 100px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WeaponIconContainer = styled.div`
  width: 50px;
  height: 50px;
  background: #333;
  border: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WeaponIcon = styled.img`
  width: 40px;
  height: auto;
  object-fit: contain;
`;

export const InGameHUD = () => {
  const currentHealth = usePlayerStore((state) => state.currentHealth);
  const level = useSessionStore((state) => state.level);
  const xp = useSessionStore((state) => state.xp);
  const nextLevelXp = useSessionStore((state) => state.nextLevelXp);
  const runTimer = useSessionStore((state) => state.runTimer);
  const togglePause = useSessionStore((state) => state.togglePause);
  const activeWeapons = useWeaponsStore((state) => state.activeWeapons);
  const getEffectivePlayerStats = usePlayerStore(
    (state) => state.getEffectivePlayerStats,
  );

  const effectiveStats = getEffectivePlayerStats();

  // Format timer mm:ss
  const minutes = Math.floor(runTimer / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(runTimer % 60)
    .toString()
    .padStart(2, "0");

  const healthPercent = (currentHealth / effectiveStats.maxHealth) * 100;
  const xpPercent = (xp / nextLevelXp) * 100;

  return (
    <HUDContainer>
      {/* Top Bar */}
      <TopBar>
        {/* Pause button - mobile only, top left */}
        <PauseButton
          type="button"
          onClick={togglePause}
          aria-label={UI_STRINGS.common.pause}
        >
          <Pause size={24} strokeWidth={2.5} />
        </PauseButton>

        {/* Timer - centered on mobile */}
        <TimerWrapper>
          <Timer>
            {minutes}:{seconds}
          </Timer>
        </TimerWrapper>

        {/* Level & XP */}
        <LevelSection>
          <LevelText>
            {UI_STRINGS.common.level}: {level}
          </LevelText>
          <XPBarContainer>
            <XPBarFill percent={xpPercent} />
          </XPBarContainer>
        </LevelSection>
      </TopBar>

      {/* Health Bar */}
      <HealthBarContainer>
        <HealthBarFill percent={healthPercent} />
        <HealthText>
          {Math.ceil(currentHealth)} / {Math.ceil(effectiveStats.maxHealth)}
        </HealthText>
      </HealthBarContainer>

      {/* Weapons List */}
      <WeaponsList>
        {activeWeapons.map((weaponId: WeaponId) => {
          const weapon = getWeapon(weaponId);
          const iconUrl = weapon?.spriteConfig.iconUrl;
          return (
            <WeaponIconContainer key={weaponId}>
              {iconUrl && weapon && (
                <WeaponIcon src={iconUrl} alt={weapon.name_he} />
              )}
            </WeaponIconContainer>
          );
        })}
      </WeaponsList>
    </HUDContainer>
  );
};
