import { useFrame, type RootState } from "@react-three/fiber";
import { useGameStore } from "./useGameStore";

/**
 * A wrapper around useFrame that only executes the callback when the game is running and not paused.
 * This consolidates the common pattern of checking isPaused and isRunning at the start of useFrame.
 *
 * @param callback - The frame callback to execute when not paused
 * @param priority - Optional priority for the frame callback (same as useFrame)
 */
export const usePauseAwareFrame = (
  callback: (state: RootState, delta: number) => void,
  priority?: number
) => {
  const { isPaused, isRunning } = useGameStore();

  useFrame((state, delta) => {
    if (isPaused || !isRunning) return;
    callback(state, delta);
  }, priority);
};

