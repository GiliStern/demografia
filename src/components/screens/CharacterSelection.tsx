import { CharacterId } from "@/types";
import { CHARACTERS } from "@/data/config/characters";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { UI_STRINGS } from "@/data/config/ui";
import { AppButton } from "../ui/AppButton";
import { CharacterCard, type CharacterCardData } from "../ui/CharacterCard";

interface CharacterSelectionProps {
  onSelectCharacter: (characterId: CharacterId) => void;
  onBack: () => void;
}

// Mock data for locked characters
const MOCK_LOCKED_CHARACTERS: CharacterCardData[] = [
  {
    variant: "locked",
    character: {
      id: "sababa_guy" as CharacterId,
      name_he: "מלך הפיתות",
      description_he: "שר המשטרה",
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
    weaponName: "פיתות",
    weaponIconUrl:
      WEAPONS.pitas.sprite_config.iconUrl ??
      WEAPONS.pitas.sprite_config.textureUrl,
  },
  {
    variant: "locked",
    character: {
      id: "falafel_master" as CharacterId,
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
  { variant: "coming-soon", placeholderText: "בקרוב" },
  { variant: "coming-soon", placeholderText: "בקרוב" },
];

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
    }
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
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.95)",
        color: "white",
        fontFamily: "sans-serif",
        direction: "rtl",
        zIndex: 100,
        padding: 0,
        overflowY: "auto",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "36px",
          marginBottom: "20px",
          textAlign: "center",
          textShadow: "0 4px 8px rgba(0,0,0,0.5)",
          letterSpacing: "2px",
        }}
      >
        {UI_STRINGS.character_select.title}
      </h1>

      {/* Character Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          marginBottom: "40px",
          maxWidth: "1000px",
          padding: "20px",
          paddingLeft: "45px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "16px",
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        {allCards.map((cardData, index) => (
          <CharacterCard
            key={index}
            data={cardData}
            onClick={() => handleCardClick(cardData)}
          />
        ))}
      </div>

      {/* Back Button */}
      <AppButton
        onClick={onBack}
        style={{
          width: "300px",
          fontSize: "24px",
          padding: "12px 24px",
        }}
      >
        ← {UI_STRINGS.common.back}
      </AppButton>
    </div>
  );
};
