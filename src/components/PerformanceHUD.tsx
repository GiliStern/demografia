/**
 * Performance HUD - Display real-time performance metrics
 * Shows FPS, entity counts, draw calls, and memory usage
 */

import { useEffect, useState } from "react";
import { performanceMonitor } from "../utils/performance/performanceMonitor";

interface PerformanceHUDProps {
  visible?: boolean;
}

export const PerformanceHUD = ({ visible = true }: PerformanceHUDProps) => {
  const [stats, setStats] = useState(performanceMonitor.getCompactStats());

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setStats(performanceMonitor.getCompactStats());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#0f0",
        padding: "8px 12px",
        fontFamily: "monospace",
        fontSize: "12px",
        borderRadius: "4px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {stats}
    </div>
  );
};
