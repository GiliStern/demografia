import type { CharacterData } from "@/types";
import styled from "@emotion/styled";

export type CharacterCardVariant = "unlocked" | "locked" | "coming-soon";

export interface CharacterCardData {
  variant: CharacterCardVariant;
  character?: CharacterData;
  weaponName?: string;
  weaponIconUrl?: string;
  placeholderText?: string;
}

interface CharacterCardProps {
  data: CharacterCardData;
  onClick?: () => void;
}

const StyledCard = styled.div<{ variant: CharacterCardVariant }>`
  width: 200px;
  height: 230px;
  background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
  border: 3px solid #444;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  ${({ variant }) => {
    switch (variant) {
      case "unlocked":
        return `
          cursor: pointer;
          border-color: #666;
          background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
          
          &:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: #999;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
            background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
          }
        `;
      case "locked":
        return `
          filter: grayscale(0.8);
          opacity: 0.7;
          cursor: not-allowed;
        `;
      case "coming-soon":
        return `
          opacity: 0.5;
          cursor: default;
          border-style: dashed;
        `;
      default:
        return "";
    }
  }}
`;

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 2px solid #333;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
`;

const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
`;

const QuestionMark = styled.div`
  font-size: 80px;
  color: #555;
  font-weight: bold;
`;

const LockIcon = styled.div`
  font-size: 60px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  z-index: 2;
`;

const Name = styled.h3`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  direction: rtl;
  margin: 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: #aaa;
  text-align: center;
  direction: rtl;
  margin: 0;
  flex-grow: 1;
`;

const WeaponInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #1a1a1a, #252525);
  border-radius: 6px;
  direction: rtl;
  border: 1px solid #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const WeaponIcon = styled.img`
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
`;

const WeaponName = styled.span`
  font-size: 16px;
  color: #fff;
`;

export const CharacterCard = ({ data, onClick }: CharacterCardProps) => {
  const { variant, character, weaponName, weaponIconUrl, placeholderText } =
    data;

  const isClickable = variant === "unlocked";

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  return (
    <StyledCard variant={variant} onClick={handleClick}>
      {/* Character Image */}
      <ImageContainer>
        {variant === "coming-soon" && <QuestionMark>?</QuestionMark>}
        {variant === "locked" && character && (
          <>
            <CharacterImage
              src={character.sprite_config.iconUrl}
              alt={character.name_he}
            />
            <LockIcon>🔒</LockIcon>
          </>
        )}
        {variant === "unlocked" && character && (
          <CharacterImage
            src={character.sprite_config.iconUrl}
            alt={character.name_he}
          />
        )}
      </ImageContainer>

      {/* Character Name */}
      <Name>
        {variant === "coming-soon"
          ? placeholderText ?? "בקרוב"
          : character?.name_he ?? "???"}
      </Name>

      {/* Character Description */}
      <Description>
        {variant === "coming-soon"
          ? ""
          : variant === "locked"
          ? "נעול - השלם אתגרים לפתיחה"
          : character?.description_he ?? ""}
      </Description>

      {/* Weapon Info */}
      {(variant === "unlocked" || variant === "locked") &&
        weaponName &&
        weaponIconUrl && (
          <WeaponInfo>
            <WeaponName>{weaponName}</WeaponName>
            <WeaponIcon src={weaponIconUrl} alt={weaponName} />
          </WeaponInfo>
        )}
    </StyledCard>
  );
};
