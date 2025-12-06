import { useGameStore } from "../store/gameStore";
import { ItemKind, PauseReason } from "../types";
import { UI_STRINGS } from "../data/config/ui";
import { renderUpgradeLabel } from "../utils/upgradeLabels";
import { AppButton } from "./ui/AppButton";

export const LevelUpOverlay = () => {
  const { pauseReason, upgradeChoices, applyUpgrade } = useGameStore();

  if (pauseReason !== PauseReason.LevelUp) return null;

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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {upgradeChoices.map((choice) => {
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
