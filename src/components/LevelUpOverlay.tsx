import { useRef } from "react";
import styled from "@emotion/styled";

import { useGameStore } from "@/store/gameStore";
import { ItemKind, PauseReason, type UpgradeOption } from "../types";
import { UI_STRINGS } from "../data/config/ui";
import { renderUpgradeLabel } from "../utils/ui/upgradeLabels";
import { AppButton } from "./ui/AppButton";
import { useMenuNavigation } from "@/hooks/controls/useMenuNavigation";

const OverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const OverlayContent = styled.div`
  background: #222;
  padding: 16px;
  border-radius: 8px;
  min-width: 450px;
`;

const OverlayTitle = styled.h3`
  margin-top: 0;
`;

const ButtonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

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
    <OverlayContainer>
      <OverlayContent>
        <OverlayTitle>{UI_STRINGS.level_up.choose_one}</OverlayTitle>
        {upgradeChoices.length === 0 && (
          <p>{UI_STRINGS.level_up.no_upgrades}</p>
        )}
        <ButtonList ref={buttonListRef}>
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
        </ButtonList>
      </OverlayContent>
    </OverlayContainer>
  );
};
