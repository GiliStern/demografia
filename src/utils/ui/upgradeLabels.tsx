import { ItemKind, type UpgradeOption } from "../../types";
import { UI_STRINGS } from "../../data/config/ui";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { PASSIVES } from "@/data/config/passives";
import type { ReactNode } from "react";

export const renderUpgradeLabel = (choice: UpgradeOption): ReactNode => {
  if (choice.kind === ItemKind.Weapon) {
    const weaponData = WEAPONS[choice.weaponId];
    const iconUrl = weaponData.sprite_config.iconUrl;
    const nextLevelData = weaponData.levels?.find(
      (lvl) => lvl.level === choice.currentLevel + 1
    );
    const upgradeText = choice.isNew
      ? UI_STRINGS.level_up.weapon_new_prefix
      : nextLevelData?.description ?? UI_STRINGS.level_up.weapon_upgrade_prefix;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {iconUrl && (
            <img
              src={iconUrl}
              alt={weaponData.name_he}
              style={{
                width: "50px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>{weaponData.name_he}</div>
            {weaponData.description_he && (
              <div
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.7,
                  marginTop: "2px",
                }}
              >
                {weaponData.description_he}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: choice.isNew ? "lightGreen" : "lightBlue",
          }}
        >
          {upgradeText}
        </div>
      </div>
    );
  }

  // Passive item upgrade
  const passiveData = PASSIVES[choice.passiveId];
  const iconUrl = passiveData.sprite_config.iconUrl;

  // Get the next level data for description
  const nextLevel = choice.currentLevel + 1;
  const nextLevelData = passiveData.levels.find(
    (lvl) => lvl.level === nextLevel
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {iconUrl && (
          <img
            src={iconUrl}
            alt={passiveData.name_he}
            style={{
              width: "50px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            {passiveData.name_he}
            {levelIndicator && (
              <span
                style={{ marginRight: "8px", fontSize: "0.9rem", opacity: 0.8 }}
              >
                {" "}
                {levelIndicator}
              </span>
            )}
          </div>
          {passiveData.description_he && (
            <div
              style={{
                fontSize: "0.8rem",
                opacity: 0.7,
                marginTop: "2px",
              }}
            >
              {passiveData.description_he}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: choice.isNew ? "lightGreen" : "lightBlue",
        }}
      >
        {upgradeText}
      </div>
    </div>
  );
};
