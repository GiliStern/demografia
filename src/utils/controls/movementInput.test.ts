import { describe, expect, it } from "vitest";
import { isInputActive, selectMovementInput } from "./movementInput";

describe("movementInput helpers", () => {
  it("detects when touch input is active", () => {
    expect(isInputActive({ x: 0, y: 0 })).toBe(false);
    expect(isInputActive({ x: 0.5, y: 0 })).toBe(true);
  });

  it("prefers touch input over keyboard input when touch is active", () => {
    expect(
      selectMovementInput({ x: 1, y: 0 }, { x: 0.2, y: -0.8 }),
    ).toEqual({ x: 0.2, y: -0.8 });
  });

  it("falls back to keyboard input when touch input is inactive", () => {
    expect(
      selectMovementInput({ x: -1, y: 1 }, { x: 0, y: 0 }),
    ).toEqual({ x: -1, y: 1 });
  });
});
