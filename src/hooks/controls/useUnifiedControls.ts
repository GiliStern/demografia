import { useEffect, useRef } from "react";
import { useKeyboardControls } from "./useKeyboardControls";
import { useTouchControls } from "./useTouchControls";

interface MoveInput {
  x: number;
  y: number;
}

/**
 * Hook that combines keyboard and touch inputs into a unified control system
 * 
 * Implementation follows creative phase decision: Simple Priority (Touch Override)
 * - If touch is active (non-zero), use touch input
 * - Otherwise, use keyboard input
 * 
 * Maintains same interface as useKeyboardControls for seamless integration
 * 
 * @returns MutableRefObject<{ x: number, y: number }> - Unified input values
 */
export const useUnifiedControls = () => {
  const keyboardControls = useKeyboardControls();
  const touchControls = useTouchControls();
  const unifiedRef = useRef<MoveInput>({ x: 0, y: 0 });

  useEffect(() => {
    const updateUnified = () => {
      const keyboard = keyboardControls.current;
      const touch = touchControls.current;

      // Simple priority: touch overrides keyboard
      // Touch is considered active if either x or y is non-zero
      const isTouchActive = touch.x !== 0 || touch.y !== 0;

      unifiedRef.current = isTouchActive ? touch : keyboard;
    };

    // Update at 60fps (16ms interval) for smooth input
    const interval = setInterval(updateUnified, 16);

    return () => {
      clearInterval(interval);
    };
  }, [keyboardControls, touchControls]);

  return unifiedRef;
};
