import { useRef } from "react";

import { useGameStore } from "@/store/gameStore";
import { ItemKind, PauseReason, type UpgradeOption } from "../types";
import { UI_STRINGS } from "../data/config/ui";
import { renderUpgradeLabel } from "../utils/ui/upgradeLabels";
import { AppButton } from "./ui/AppButton";
import { useMenuNavigation } from "@/hooks/controls/useMenuNavigation";

export const LevelUpOverlay = () => {
  const { pauseReason, upgradeChoices, applyUpgrade } = useGameStore();
  const isLevelUpMenu = pauseReason === PauseReason.LevelUp;
  const buttonListRef = useRef<HTMLDivElement>(null);

  useMenuNavigation({
    containerRef: buttonListRef,
    isActive: isLevelUpMenu,
    focusKey: upgradeChoices.length,
  });

  if (!isLevelUpMenu) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: "#222",
          padding: "16px",
          borderRadius: "8px",
          minWidth: "450px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>{UI_STRINGS.level_up.choose_one}</h3>
        {upgradeChoices.length === 0 && (
          <p>{UI_STRINGS.level_up.no_upgrades}</p>
        )}
        <div
          ref={buttonListRef}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          {upgradeChoices.map((choice: UpgradeOption) => {
            const choiceId =
              choice.kind === ItemKind.Weapon
                ? choice.weaponId
                : choice.passiveId;

            return (
              <AppButton
                key={`${choiceId}-${choice.isNew ? "new" : "upgrade"}`}
                onClick={() => applyUpgrade(choice)}
              >
                {renderUpgradeLabel(choice)}
              </AppButton>
            );
          })}
        </div>
      </div>
    </div>
  );
};
