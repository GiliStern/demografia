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
          <div>{weaponData.name_he}</div>
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

  const passiveData = PASSIVES[choice.passiveId];
  const iconUrl = passiveData.sprite_config.iconUrl;
  return (
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
      {UI_STRINGS.level_up.passive_prefix} {passiveData.name_he}
    </div>
  );
};
