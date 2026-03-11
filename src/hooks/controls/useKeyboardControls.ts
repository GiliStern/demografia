import { useEffect, useRef } from "react";
import type { MoveInput } from "@/types/hooks/controls";

export const useKeyboardControls = (
  onChange?: (input: MoveInput) => void,
) => {
  const inputRef = useRef<MoveInput>({ x: 0, y: 0 });

  useEffect(() => {
    const keys = new Set<string>();

    const handleKeyChange = (event: KeyboardEvent, isDown: boolean) => {
      if (isDown) {
        keys.add(event.key);
      } else {
        keys.delete(event.key);
      }

      const up = keys.has("ArrowUp") || keys.has("w") || keys.has("W");
      const down = keys.has("ArrowDown") || keys.has("s") || keys.has("S");
      const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
      const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");

      const nextInput = {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (up ? 1 : 0) - (down ? 1 : 0),
      };
      inputRef.current = nextInput;
      onChange?.(nextInput);
    };

    const handleKeyDown = (event: KeyboardEvent) => handleKeyChange(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKeyChange(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onChange]);

  return inputRef;
};
