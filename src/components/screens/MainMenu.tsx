import { useGameStore } from "../../hooks/useGameStore";
import { UI_STRINGS } from "../../data/config/ui";
import { CharacterId } from "@/types";
import { AppButton } from "../ui/AppButton";

export const MainMenu = () => {
  const { startGame, resumeGame, isPaused, isRunning } = useGameStore();
  const canResume = isRunning && isPaused;

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
        gap: "40px",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        fontFamily: "sans-serif",
        direction: "rtl",
        zIndex: 100,
      }}
    >
      {!canResume && (
        <img
          src="/assets/main_banner.png"
          alt={UI_STRINGS.menu.title}
          style={{ width: "800px", height: "auto" }}
        />
      )}

      {canResume && (
        <div style={{ fontSize: "32px" }}>{UI_STRINGS.common.paused}</div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "400px",
        }}
      >
        {canResume && (
          <AppButton onClick={resumeGame}>{UI_STRINGS.common.resume}</AppButton>
        )}

        {!canResume && (
          <AppButton
            tabIndex={0}
            autoFocus
            onClick={() => startGame(CharacterId.Srulik)}
          >
            {UI_STRINGS.menu.play}
          </AppButton>
        )}

        <AppButton disabled variant="disabled">
          {UI_STRINGS.menu.meta_shop} ({UI_STRINGS.common.locked})
        </AppButton>

        <AppButton disabled variant="disabled">
          {UI_STRINGS.menu.settings} ({UI_STRINGS.common.locked})
        </AppButton>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          color: "#666",
        }}
      >
        {UI_STRINGS.menu.version} 0.1.0
      </div>
    </div>
  );
};
