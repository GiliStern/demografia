import type { CharacterData } from "@/types";
import styled from "@emotion/styled";
import { Lock } from "lucide-react";

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

const StyledCardButton = styled.button`
  width: 250px;
  height: max-content;
  background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
  border: 3px solid #444;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 8px;
  padding-top: 20px;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  min-width: 44px;
  cursor: pointer;
  user-select: none;

  :has([data-variant="unlocked"]) {
    cursor: pointer;
    border-color: #666;
    background: linear-gradient(145deg, #3a3a3a, #2a2a2a);

    &:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: #999;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
      background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
    }
  }

  :has([data-variant="locked"]) {
    filter: grayscale(0.8);
    opacity: 0.7;
    cursor: not-allowed;
  }

  :has([data-variant="coming-soon"]) {
    opacity: 0.5;
    cursor: default;
    border-style: dashed;
  }

  :disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: grayscale(0.8);
  }
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
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }

  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
  }
`;

const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
`;

const QuestionMark = styled.div`
  font-size: 60px;
  color: #555;
  font-weight: bold;
  position: absolute;
  transform: translate(0, 7%);
`;

const LockIcon = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  z-index: 2;
  background: #222;
`;

const Name = styled.h3`
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  text-align: right;
  direction: rtl;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #aaa;
  text-align: right;
  direction: rtl;
  margin: 0;
  flex-grow: 1;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const WeaponInfo = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: linear-gradient(135deg, #1a1a1a, #252525);
  border-radius: 6px;
  direction: rtl;
  border: 1px solid #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const WeaponIcon = styled.img`
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
`;

const WeaponName = styled.span`
  font-size: 14px;
  color: #fff;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
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
    <StyledCardButton
      data-variant={variant}
      onClick={handleClick}
      disabled={variant !== "unlocked"}
    >
      {variant === "locked" && (
        <LockIcon>
          <Lock size={30} />
        </LockIcon>
      )}

      {/* Weapon Info */}
      {weaponName && weaponIconUrl && (
        <WeaponInfo>
          <WeaponIcon src={weaponIconUrl} alt={weaponName} />
          <WeaponName>{weaponName}</WeaponName>
        </WeaponInfo>
      )}
      {/* Character Image */}
      <ImageContainer>
        {variant === "coming-soon" && <QuestionMark>?</QuestionMark>}
        {character && (
          <CharacterImage
            src={character.sprite_config.iconUrl}
            alt={character.name_he}
          />
        )}
      </ImageContainer>

      <TextContainer>
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
      </TextContainer>
    </StyledCardButton>
  );
};
