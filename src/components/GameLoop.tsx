import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { performanceMonitor } from "../utils/performance/performanceMonitor";
import { useRef } from "react";

export const GameLoop = () => {
  const updateTimer = useGameStore((state) => state.updateTimer);
  const logIntervalRef = useRef(0);

  useFrame((_state, delta) => {
    updateTimer(delta);

    // Track performance
    performanceMonitor.updateFrame(delta);

    // Log stats every 5 seconds in development
    if (import.meta.env.DEV) {
      logIntervalRef.current += delta;
      if (logIntervalRef.current >= 5) {
        performanceMonitor.logStats();
        logIntervalRef.current = 0;
      }
    }
  });

  return null;
};
