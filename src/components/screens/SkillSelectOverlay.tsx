import { UI_STRINGS } from "@/data/config/ui";
import { useGameStore } from "../../store/gameStore";

export const SkillSelectOverlay = () => {
  const resumeGame = useGameStore((state) => state.resumeGame);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: "24px 32px",
          background: "#1d1d1d",
          border: "1px solid #444",
          borderRadius: "8px",
          minWidth: "320px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0" }}>{UI_STRINGS.level_up.title}</h2>
        <p style={{ margin: "0 0 16px 0", color: "#ccc" }}>
          A proper skill selection UI will appear here. For now, continue to
          keep playing.
        </p>
        <button
          onClick={resumeGame}
          style={{
            padding: "10px 18px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {UI_STRINGS.common.resume}
        </button>
      </div>
    </div>
  );
};
