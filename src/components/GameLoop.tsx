import { useFrame } from "@react-three/fiber";
import { useSessionStore } from "@/store/sessionStore";
import { useGameStore } from "@/store/gameStore";
import { performanceMonitor } from "../utils/performance/performanceMonitor";
import { getEnemyManager } from "@/simulation/enemyManager";
import { getProjectileManager } from "@/simulation/projectileManager";
import { useRef } from "react";

export const GameLoop = () => {
  const updateTimer = useSessionStore((state) => state.updateTimer);
  const logIntervalRef = useRef(0);

  useFrame((state, delta) => {
    updateTimer(delta);

    // Track performance
    performanceMonitor.updateFrame(delta);

    // Feed live entity counts and draw calls
    const enemies = getEnemyManager().getCount();
    const projectiles = getProjectileManager().getCount();
    const xpOrbs = useGameStore.getState().xpOrbsMap.size;
    performanceMonitor.setEntityCounts({ enemies, projectiles, xpOrbs });
    performanceMonitor.setPoolStats({
      enemies: { active: enemies, available: 0, total: enemies },
      projectiles: { active: projectiles, available: 0, total: projectiles },
      xpOrbs: { active: xpOrbs, available: 0, total: xpOrbs },
    });
    const gl = state.gl as {
      info?: { render?: { drawCalls?: number; calls?: number } };
    };
    const drawCalls = gl?.info?.render?.drawCalls ?? gl?.info?.render?.calls ?? 0;
    performanceMonitor.setDrawCalls(drawCalls);

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
