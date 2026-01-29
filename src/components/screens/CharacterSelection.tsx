import { styled } from "@linaria/react";
import { CharacterId } from "@/types";
import { CHARACTERS } from "@/data/config/characters";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { UI_STRINGS } from "@/data/config/ui";
import { StyledButton } from "../ui/AppButton";
import { CharacterCard, type CharacterCardData } from "../ui/CharacterCard";
import { ArrowRight } from "lucide-react";

interface CharacterSelectionProps {
  onSelectCharacter: (characterId: CharacterId) => void;
  onBack: () => void;
}

// Mock data for locked characters
const MOCK_LOCKED_CHARACTERS: CharacterCardData[] = [
  {
    variant: "locked",
    character: {
      id: "nehoray" as CharacterId,
      name_he: "נהוראי",
      description_he: "שף מוכשר עם כישורי קרב.",
      starting_weapon_id: CHARACTERS[CharacterId.Srulik].starting_weapon_id,
      passive_id: CHARACTERS[CharacterId.Srulik].passive_id,
      stats: CHARACTERS[CharacterId.Srulik].stats,
      sprite_config: {
        textureUrl: CHARACTERS[CharacterId.Srulik].sprite_config.textureUrl,
        iconUrl: CHARACTERS[CharacterId.Srulik].sprite_config.iconUrl ?? "",
        index: 0,
        scale: 2,
        spriteFrameSize: 256,
      },
    },
    weaponName: "כסאות כתר",
    weaponIconUrl:
      WEAPONS.keter_chairs.sprite_config.iconUrl ??
      WEAPONS.keter_chairs.sprite_config.textureUrl,
  },
];

// Mock data for coming soon characters
const MOCK_COMING_SOON_CHARACTERS: CharacterCardData[] = [
  { variant: "coming-soon", placeholderText: "בקרוב" },
  { variant: "coming-soon", placeholderText: "בקרוב" },
  { variant: "coming-soon", placeholderText: "בקרוב" },
];

const SelectionContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  font-family: sans-serif;
  direction: rtl;
  z-index: 100;
  padding: 20px;
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  pointer-events: auto;

  @media (max-width: 768px) {
    padding: 16px;
    padding-bottom: 80px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    padding-bottom: 70px;
  }
`;

const SelectionTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  margin-top: 20px;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 16px;
    margin-top: 10px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 12px;
    margin-top: 8px;
  }
`;

const CharacterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  gap: 20px;
  row-gap: 20px;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  max-width: 1000px;
  width: 100%;
  padding: 20px;
  padding-left: 45px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding-left: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
    margin-bottom: 24px;
  }
`;

const BackButton = styled(StyledButton)`
  width: max-content;
  font-size: 24px;
  padding: 12px 24px;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
    font-size: 20px;
  }

  @media (max-width: 480px) {
    width: 100%;
    font-size: 18px;
    padding: 10px 20px;
  }
`;

export const CharacterSelection = ({
  onSelectCharacter,
  onBack,
}: CharacterSelectionProps) => {
  // Build unlocked character cards
  const unlockedCards: CharacterCardData[] = Object.values(CHARACTERS).map(
    (character) => {
      const weapon = WEAPONS[character.starting_weapon_id];
      return {
        variant: "unlocked" as const,
        character,
        weaponName: weapon.name_he,
        weaponIconUrl:
          weapon.sprite_config.iconUrl ?? weapon.sprite_config.textureUrl,
      };
    },
  );

  // Combine all cards
  const allCards: CharacterCardData[] = [
    ...unlockedCards,
    ...MOCK_LOCKED_CHARACTERS,
    ...MOCK_COMING_SOON_CHARACTERS,
  ];

  const handleCardClick = (cardData: CharacterCardData) => {
    if (cardData.variant === "unlocked" && cardData.character) {
      onSelectCharacter(cardData.character.id);
    }
  };

  return (
    <SelectionContainer data-menu-container="true">
      {/* Title */}
      <SelectionTitle>{UI_STRINGS.character_select.title}</SelectionTitle>

      {/* Character Grid */}
      <CharacterGrid>
        {allCards.map((cardData, index) => (
          <CharacterCard
            key={index}
            data={cardData}
            onClick={() => handleCardClick(cardData)}
          />
        ))}
      </CharacterGrid>

      {/* Back Button */}
      <BackButton onClick={onBack}>
        <ArrowRight /> {UI_STRINGS.common.back}
      </BackButton>
    </SelectionContainer>
  );
};
