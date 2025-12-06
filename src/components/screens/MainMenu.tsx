import { useGameStore } from "../../store/gameStore";
import { UI_STRINGS } from "../../data/config/ui";
import { CharacterId } from "@/types";

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
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        fontFamily: "sans-serif",
        direction: "rtl",
        zIndex: 100,
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "40px", color: "#61dafb" }}>
        דמוגרפיה
      </h1>

      {canResume && (
        <div style={{ marginBottom: "20px", fontSize: "20px" }}>
          {UI_STRINGS.common.paused}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "300px",
        }}
      >
        {canResume && (
          <button
            onClick={resumeGame}
            style={{
              padding: "15px",
              fontSize: "24px",
              background: "#444",
              color: "white",
              border: "2px solid #666",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            {UI_STRINGS.common.resume}
          </button>
        )}

        {!canResume && (
          <button
            onClick={() => startGame(CharacterId.Srulik)}
            style={{
              padding: "15px",
              fontSize: "24px",
              background: "#444",
              color: "white",
              border: "2px solid #666",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            {UI_STRINGS.menu.play}
          </button>
        )}

        <button
          disabled
          style={{
            padding: "15px",
            fontSize: "24px",
            background: "#222",
            color: "#666",
            border: "2px solid #333",
            cursor: "not-allowed",
            borderRadius: "8px",
          }}
        >
          {UI_STRINGS.menu.meta_shop} ({UI_STRINGS.common.locked})
        </button>

        <button
          disabled
          style={{
            padding: "15px",
            fontSize: "24px",
            background: "#222",
            color: "#666",
            border: "2px solid #333",
            cursor: "not-allowed",
            borderRadius: "8px",
          }}
        >
          {UI_STRINGS.menu.settings} ({UI_STRINGS.common.locked})
        </button>
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
