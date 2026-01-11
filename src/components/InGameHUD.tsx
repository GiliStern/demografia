import styled from "@emotion/styled";
import { useGameStore } from "@/store/gameStore";
import { UI_STRINGS } from "../data/config/ui";
import { WEAPONS } from "../data/config/weaponsConfig";
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
`;

const LevelSection = styled.div`
  width: 30%;
`;

const LevelText = styled.div`
  font-size: 24px;
  font-weight: bold;
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

const Timer = styled.div`
  font-size: 32px;
  font-weight: bold;
  font-family: monospace;
`;

const GoldSection = styled.div`
  width: 30%;
  text-align: left;
  font-size: 24px;
  color: gold;
`;

const HealthBarContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 20px;
  background: #444;
  border: 2px solid white;
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
  const {
    currentHealth,
    level,
    gold,
    xp,
    nextLevelXp,
    runTimer,
    activeWeapons,
    getEffectivePlayerStats,
  } = useGameStore();

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
        {/* Level & XP */}
        <LevelSection>
          <LevelText>
            {UI_STRINGS.common.level}: {level}
          </LevelText>
          <XPBarContainer>
            <XPBarFill percent={xpPercent} />
          </XPBarContainer>
        </LevelSection>

        {/* Timer */}
        <Timer>
          {minutes}:{seconds}
        </Timer>

        {/* Gold */}
        <GoldSection>
          {UI_STRINGS.common.gold}: {gold}
        </GoldSection>
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
          const weapon = WEAPONS[weaponId];
          const iconUrl = weapon.sprite_config.iconUrl;
          return (
            <WeaponIconContainer key={weaponId}>
              {iconUrl && (
                <WeaponIcon src={iconUrl} alt={weapon.name_he} />
              )}
            </WeaponIconContainer>
          );
        })}
      </WeaponsList>
    </HUDContainer>
  );
};
