import { useCallback, useMemo, useRef, useState } from "react";
import { useKeyboardControls } from "./useKeyboardControls";
import { useTouchControls } from "./useTouchControls";
import type { MoveInput } from "@/types/hooks/controls";
import { selectMovementInput } from "@/utils/controls/movementInput";

/**
 * Hook that combines keyboard and touch inputs into a unified control system
 *
 * Implementation follows creative phase decision: Simple Priority (Touch Override)
 * - If touch is active (non-zero), use touch input
 * - Otherwise, use keyboard input
 *
 * Returns a shared movement ref for gameplay plus the current touch input for UI rendering.
 */
export const useUnifiedControls = (touchEnabled = true) => {
  const keyboardStateRef = useRef<MoveInput>({ x: 0, y: 0 });
  const touchStateRef = useRef<MoveInput>({ x: 0, y: 0 });
  const unifiedRef = useRef<MoveInput>({ x: 0, y: 0 });
  const [touchInput, setTouchInput] = useState<MoveInput>({ x: 0, y: 0 });

  const updateUnified = useCallback(() => {
    unifiedRef.current = selectMovementInput(
      keyboardStateRef.current,
      touchStateRef.current,
    );
  }, []);

  const handleKeyboardChange = useCallback(
    (input: MoveInput) => {
      keyboardStateRef.current = input;
      updateUnified();
    },
    [updateUnified],
  );

  const handleTouchChange = useCallback(
    (input: MoveInput) => {
      touchStateRef.current = input;
      setTouchInput(input);
      updateUnified();
    },
    [updateUnified],
  );

  useKeyboardControls(handleKeyboardChange);
  useTouchControls(touchEnabled, handleTouchChange);

  return useMemo(
    () => ({
      inputRef: unifiedRef,
      touchInput,
    }),
    [touchInput],
  );
};
