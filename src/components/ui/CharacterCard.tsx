import type { CSSProperties } from "react";
import type { CharacterData } from "@/types";

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

const CARD_BASE_STYLE: CSSProperties = {
  width: "200px",
  height: "230px",
  background: "linear-gradient(145deg, #2a2a2a, #1f1f1f)",
  border: "3px solid #444",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px",
  gap: "8px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
};

const UNLOCKED_STYLE: CSSProperties = {
  cursor: "pointer",
  borderColor: "#666",
  background: "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
};

const LOCKED_STYLE: CSSProperties = {
  filter: "grayscale(0.8)",
  opacity: 0.7,
  cursor: "not-allowed",
};

const COMING_SOON_STYLE: CSSProperties = {
  opacity: 0.5,
  cursor: "default",
  borderStyle: "dashed",
};

const IMAGE_CONTAINER_STYLE: CSSProperties = {
  width: "100px",
  height: "100px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #1a1a1a, #0f0f0f)",
  borderRadius: "8px",
  overflow: "hidden",
  position: "relative",
  border: "2px solid #333",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
};

const CHARACTER_IMAGE_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  imageRendering: "pixelated",
};

const QUESTION_MARK_STYLE: CSSProperties = {
  fontSize: "80px",
  color: "#555",
  fontWeight: "bold",
};

const LOCK_ICON_STYLE: CSSProperties = {
  fontSize: "60px",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "#fff",
  textShadow: "0 0 10px rgba(0,0,0,0.8)",
  zIndex: 2,
};

const NAME_STYLE: CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#fff",
  textAlign: "center",
  direction: "rtl",
  margin: 0,
};

const DESCRIPTION_STYLE: CSSProperties = {
  fontSize: "14px",
  color: "#aaa",
  textAlign: "center",
  direction: "rtl",
  margin: 0,
  flexGrow: 1,
};

const WEAPON_INFO_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  background: "linear-gradient(135deg, #1a1a1a, #252525)",
  borderRadius: "6px",
  direction: "rtl",
  border: "1px solid #333",
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
};

const WEAPON_ICON_STYLE: CSSProperties = {
  width: "32px",
  height: "32px",
  imageRendering: "pixelated",
};

const WEAPON_NAME_STYLE: CSSProperties = {
  fontSize: "16px",
  color: "#fff",
};

export const CharacterCard = ({ data, onClick }: CharacterCardProps) => {
  const { variant, character, weaponName, weaponIconUrl, placeholderText } =
    data;

  const isClickable = variant === "unlocked";

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClickable) {
      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
      e.currentTarget.style.borderColor = "#999";
      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.5)";
      e.currentTarget.style.background =
        "linear-gradient(145deg, #4a4a4a, #3a3a3a)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClickable) {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.borderColor = "#666";
      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
      e.currentTarget.style.background =
        "linear-gradient(145deg, #3a3a3a, #2a2a2a)";
    }
  };

  let variantStyle: CSSProperties = {};
  if (variant === "unlocked") {
    variantStyle = UNLOCKED_STYLE;
  } else if (variant === "locked") {
    variantStyle = LOCKED_STYLE;
  } else {
    variantStyle = COMING_SOON_STYLE;
  }

  const cardStyle: CSSProperties = {
    ...CARD_BASE_STYLE,
    ...variantStyle,
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Character Image */}
      <div style={IMAGE_CONTAINER_STYLE}>
        {variant === "coming-soon" && <div style={QUESTION_MARK_STYLE}>?</div>}
        {variant === "locked" && character && (
          <>
            <img
              src={character.sprite_config.iconUrl}
              alt={character.name_he}
              style={CHARACTER_IMAGE_STYLE}
            />
            <div style={LOCK_ICON_STYLE}>🔒</div>
          </>
        )}
        {variant === "unlocked" && character && (
          <img
            src={character.sprite_config.iconUrl}
            alt={character.name_he}
            style={CHARACTER_IMAGE_STYLE}
          />
        )}
      </div>

      {/* Character Name */}
      <h3 style={NAME_STYLE}>
        {variant === "coming-soon"
          ? placeholderText ?? "בקרוב"
          : character?.name_he ?? "???"}
      </h3>

      {/* Character Description */}
      <p style={DESCRIPTION_STYLE}>
        {variant === "coming-soon"
          ? ""
          : variant === "locked"
          ? "נעול - השלם אתגרים לפתיחה"
          : character?.description_he ?? ""}
      </p>

      {/* Weapon Info */}
      {(variant === "unlocked" || variant === "locked") &&
        weaponName &&
        weaponIconUrl && (
          <div style={WEAPON_INFO_STYLE}>
            <span style={WEAPON_NAME_STYLE}>{weaponName}</span>
            <img
              src={weaponIconUrl}
              alt={weaponName}
              style={WEAPON_ICON_STYLE}
            />
          </div>
        )}
    </div>
  );
};
