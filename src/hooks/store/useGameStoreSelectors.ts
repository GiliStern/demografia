/**
 * Common Zustand selector hooks to avoid repeated selector patterns
 * These hooks extract commonly used combinations of store selectors
 */

import { useGameStore } from "@/store/gameStore";
import type { WeaponId, PlayerStats, WeaponStats } from "@/types";

/**
 * Returns game pause state
 * Used by hooks that need to check if the game is paused or running
 */
export const useGamePauseState = () => {
  const isPaused = useGameStore((state) => state.isPaused);
  const isRunning = useGameStore((state) => state.isRunning);
  return { isPaused, isRunning };
};

/**
 * Returns player position and direction
 * Used by hooks that need to track player movement
 */
export const usePlayerPositionState = () => {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const playerDirection = useGameStore((state) => state.playerDirection);
  return { playerPosition, playerDirection };
};

/**
 * Returns effective player stats (base stats + passive effects)
 * Used by hooks that need player stats for calculations
 */
export const usePlayerStats = (): PlayerStats => {
  return useGameStore((state) => state.getEffectivePlayerStats());
};

/**
 * Returns weapon stats getter function
 * Used by weapon hooks to get weapon stats with player multipliers
 */
export const useWeaponStats = (
  weaponId: WeaponId
): { getWeaponStats: (id: WeaponId) => WeaponStats; stats: WeaponStats } => {
  const getWeaponStats = useGameStore((state) => state.getWeaponStats);
  const stats = getWeaponStats(weaponId);
  return { getWeaponStats, stats };
};

/**
 * Returns enemy positions map
 * Used by hooks that need to locate enemies (e.g., for targeting)
 */
export const useEnemiesPositions = () => {
  return useGameStore((state) => state.enemiesPositions);
};

/**
 * Returns viewport bounds
 * Used by hooks that need to check boundaries for spawning or culling
 */
export const useViewportBounds = () => {
  return useGameStore((state) => state.viewportBounds);
};

/**
 * Returns all commonly used game state for weapon hooks
 * Combines pause state, player position/stats, and weapon stats getter
 */
export const useWeaponHookState = ({ weaponId }: { weaponId: WeaponId }) => {
  const { isPaused, isRunning } = useGamePauseState();
  const { playerPosition, playerDirection } = usePlayerPositionState();
  const playerStats = usePlayerStats();
  const { getWeaponStats, stats } = useWeaponStats(weaponId);

  return {
    isPaused,
    isRunning,
    playerPosition,
    playerDirection,
    playerStats,
    getWeaponStats,
    stats,
  };
};

/**
 * Returns all commonly used game state for entity behavior hooks
 * Combines pause state and player position
 */
export const useEntityBehaviorState = () => {
  const { isPaused, isRunning } = useGamePauseState();
  const playerPosition = useGameStore((state) => state.playerPosition);

  return {
    isPaused,
    isRunning,
    playerPosition,
  };
};
