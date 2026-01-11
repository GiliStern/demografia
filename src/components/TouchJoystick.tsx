import { useState, useEffect, useRef, type CSSProperties } from "react";

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
export const TouchJoystick = ({ isVisible, touchInput }: TouchJoystickProps) => {
  const [isActive, setIsActive] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  
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

  // Base circle style (from creative phase specifications)
  const baseStyle: CSSProperties = {
    position: "absolute",
    bottom: "30px",
    left: "30px",
    width: `${sizes.base}px`,
    height: `${sizes.base}px`,
    borderRadius: "50%",
    background: "linear-gradient(145deg, #2a2a2a, #1f1f1f)",
    border: isActive ? "3px solid #666" : "3px solid #444",
    boxShadow: "0 4px 6px rgba(0,0,0,0.5)",
    opacity: isActive ? 0.7 : 0.3,
    transition: "opacity 0.2s ease-in, border-color 0.2s ease-in",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // Let touch events pass through to window
    zIndex: 1000,
  };

  // Knob style (from creative phase specifications)
  // Note: Invert Y-axis for visual display to match screen coordinates
  // (touchInput.y is inverted for game coordinates, but visual should match screen)
  const knobStyle: CSSProperties = {
    width: `${sizes.knob}px`,
    height: `${sizes.knob}px`,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3a3a3a, #2a2a2a)",
    border: "2px solid #666",
    boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
    opacity: isActive ? 0.9 : 0.5,
    transition: "opacity 0.2s ease-in",
    transform: `translate(${touchInput.x * sizes.maxRadius}px, ${-touchInput.y * sizes.maxRadius}px)`,
    willChange: "transform",
    pointerEvents: "none",
  };

  return (
    <div ref={joystickRef} style={baseStyle}>
      <div ref={knobRef} style={knobStyle} />
    </div>
  );
};
