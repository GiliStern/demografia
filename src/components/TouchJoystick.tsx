import { useState, useEffect } from "react";
import styled from "@emotion/styled";

interface TouchJoystickProps {
  isVisible: boolean;
  touchInput: { x: number; y: number };
}

/**
 * Touch Joystick Component
 *
 * Visual joystick overlay for mobile touch controls
 * Follows creative phase design decisions:
 * - Fixed position at bottom-left
 * - Dark theme matching game aesthetic
 * - Responsive sizing based on screen width
 * - Opacity transitions for visual feedback
 */

interface JoystickBaseProps {
  baseSize: number;
  isActive: boolean;
}

const JoystickBase = styled.div<JoystickBaseProps>`
  position: absolute;
  bottom: 30px;
  left: 30px;
  width: ${({ baseSize }) => `${baseSize}px`};
  height: ${({ baseSize }) => `${baseSize}px`};
  border-radius: 50%;
  background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
  border: ${({ isActive }) => (isActive ? "3px solid #666" : "3px solid #444")};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  opacity: ${({ isActive }) => (isActive ? 0.7 : 0.3)};
  transition: opacity 0.2s ease-in, border-color 0.2s ease-in;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
`;

interface JoystickKnobProps {
  knobSize: number;
  maxRadius: number;
  isActive: boolean;
  x: number;
  y: number;
}

const JoystickKnob = styled.div<JoystickKnobProps>`
  width: ${({ knobSize }) => `${knobSize}px`};
  height: ${({ knobSize }) => `${knobSize}px`};
  border-radius: 50%;
  background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
  border: 2px solid #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  opacity: ${({ isActive }) => (isActive ? 0.9 : 0.5)};
  transition: opacity 0.2s ease-in;
  transform: translate(
    ${({ x, maxRadius }) => `${x * maxRadius}px`},
    ${({ y, maxRadius }) => `${-y * maxRadius}px`}
  );
  will-change: transform;
  pointer-events: none;
`;

export const TouchJoystick = ({
  isVisible,
  touchInput,
}: TouchJoystickProps) => {
  const [isActive, setIsActive] = useState(false);

  // Responsive sizing (from creative phase)
  const getJoystickSize = (screenWidth: number) => {
    if (screenWidth < 400) return { base: 100, knob: 40, maxRadius: 30 };
    if (screenWidth < 600) return { base: 120, knob: 50, maxRadius: 35 };
    return { base: 140, knob: 60, maxRadius: 40 };
  };

  const [sizes, setSizes] = useState(() => getJoystickSize(window.innerWidth));

  useEffect(() => {
    const updateSizes = () => {
      setSizes(getJoystickSize(window.innerWidth));
    };

    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  // Monitor touch input to determine active state and update knob position
  useEffect(() => {
    const active = touchInput.x !== 0 || touchInput.y !== 0;
    setIsActive(active);
  }, [touchInput]);

  if (!isVisible) {
    return null;
  }

  return (
    <JoystickBase baseSize={sizes.base} isActive={isActive}>
      <JoystickKnob
        knobSize={sizes.knob}
        maxRadius={sizes.maxRadius}
        isActive={isActive}
        x={touchInput.x}
        y={touchInput.y}
      />
    </JoystickBase>
  );
};
