import type { MoveInput } from "@/types/hooks/controls";

export const isInputActive = (input: MoveInput): boolean =>
  input.x !== 0 || input.y !== 0;

export const selectMovementInput = (
  keyboardInput: MoveInput,
  touchInput: MoveInput,
): MoveInput => {
  return isInputActive(touchInput) ? touchInput : keyboardInput;
};
