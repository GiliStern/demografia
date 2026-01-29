/**
 * Performance HUD - Display real-time performance metrics
 * Shows FPS, entity counts, draw calls, and memory usage
 */

import { useEffect, useState } from "react";
import { styled } from "@linaria/react";
import { performanceMonitor } from "../utils/performance/performanceMonitor";

interface PerformanceHUDProps {
  visible?: boolean;
}

const PerformanceContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #0f0;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 12px;
  border-radius: 4px;
  z-index: 9999;
  pointer-events: none;
`;

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

  return <PerformanceContainer>{stats}</PerformanceContainer>;
};
