import { styled } from "@linaria/react";
import { ItemKind, type UpgradeOption } from "../../types";
import { UI_STRINGS } from "../../data/config/ui";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { PASSIVES } from "@/data/config/passives";
import type { ReactNode } from "react";

const UpgradeLabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UpgradeIcon = styled.img`
  width: 50px;
  height: auto;
  object-fit: contain;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DescriptionText = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 2px;
`;

const UpgradeText = styled.div<{ isNew: boolean }>`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ isNew }) => (isNew ? "lightGreen" : "lightBlue")};
`;

const LevelIndicator = styled.span`
  margin-right: 8px;
  font-size: 0.9rem;
  opacity: 0.8;
`;

export const renderUpgradeLabel = (choice: UpgradeOption): ReactNode => {
  if (choice.kind === ItemKind.Weapon) {
    const weaponData = WEAPONS[choice.weaponId];
    const iconUrl = weaponData.sprite_config.iconUrl;
    const nextLevelData = weaponData.levels?.find(
      (lvl) => lvl.level === choice.currentLevel + 1,
    );
    const upgradeText = choice.isNew
      ? UI_STRINGS.level_up.weapon_new_prefix
      : (nextLevelData?.description ??
        UI_STRINGS.level_up.weapon_upgrade_prefix);

    return (
      <UpgradeLabelContainer>
        <IconContainer>
          {iconUrl && <UpgradeIcon src={iconUrl} alt={weaponData.name_he} />}
          <TextContainer>
            <div>{weaponData.name_he}</div>
            {weaponData.description_he && (
              <DescriptionText>{weaponData.description_he}</DescriptionText>
            )}
          </TextContainer>
        </IconContainer>
        <UpgradeText isNew={choice.isNew}>{upgradeText}</UpgradeText>
      </UpgradeLabelContainer>
    );
  }

  // Passive item upgrade
  const passiveData = PASSIVES[choice.passiveId];
  const iconUrl = passiveData.sprite_config.iconUrl;

  // Get the next level data for description
  const nextLevel = choice.currentLevel + 1;
  const nextLevelData = passiveData.levels.find(
    (lvl) => lvl.level === nextLevel,
  );

  // Build upgrade text
  let upgradeText: string;
  if (choice.isNew) {
    // New passive - show first level description
    const firstLevelData = passiveData.levels.find((lvl) => lvl.level === 1);
    upgradeText =
      firstLevelData?.description ?? UI_STRINGS.level_up.passive_prefix;
  } else {
    // Upgrading existing passive - show next level description
    upgradeText = nextLevelData?.description ?? `רמה ${nextLevel}`;
  }

  // Show level indicator for existing passives
  const levelIndicator = choice.isNew
    ? null
    : `(${choice.currentLevel}→${nextLevel})`;

  return (
    <UpgradeLabelContainer>
      <IconContainer>
        {iconUrl && <UpgradeIcon src={iconUrl} alt={passiveData.name_he} />}
        <TextContainer>
          <div>
            {passiveData.name_he}
            {levelIndicator && (
              <LevelIndicator> {levelIndicator}</LevelIndicator>
            )}
          </div>
          {passiveData.description_he && (
            <DescriptionText>{passiveData.description_he}</DescriptionText>
          )}
        </TextContainer>
      </IconContainer>
      <UpgradeText isNew={choice.isNew}>{upgradeText}</UpgradeText>
    </UpgradeLabelContainer>
  );
};
