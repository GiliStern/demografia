import { useEffect, useRef } from "react";

interface TouchPosition {
  x: number;
  y: number;
}

/**
 * Hook to handle touch input and convert to joystick position
 * Returns a ref with normalized input values (-1 to 1) matching useKeyboardControls format
 *
 * Implementation follows creative phase decisions:
 * - Circular dead zone (8% of max radius)
 * - Normalization to -1 to 1 range
 * - Prioritizes first touch, ignores subsequent touches
 *
 * @param enabled - Whether touch controls should be active (default: true)
 * @returns MutableRefObject<{ x: number, y: number }> - Normalized input values
 */
export const useTouchControls = (enabled = true) => {
  const inputRef = useRef<TouchPosition>({ x: 0, y: 0 });

  // Track initial touch position and active touch ID
  const initialTouchRef = useRef<TouchPosition | null>(null);
  const activeTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<TouchPosition | null>(null);

  // Joystick configuration (from creative phase decisions)
  const MAX_RADIUS = 35; // Maximum movement radius in pixels (for 120px base)
  const DEAD_ZONE_PERCENT = 0.08; // 8% dead zone
  const DEAD_ZONE_RADIUS = MAX_RADIUS * DEAD_ZONE_PERCENT;

  useEffect(() => {
    // If touch controls are disabled, don't set up event listeners
    if (!enabled) {
      // Reset state when disabled
      activeTouchIdRef.current = null;
      initialTouchRef.current = null;
      joystickCenterRef.current = null;
      inputRef.current = { x: 0, y: 0 };
      return;
    }

    /**
     * Normalize touch position to -1 to 1 range
     * Based on creative phase algorithm design
     */
    const normalizeTouchInput = (
      touchX: number,
      touchY: number,
      initialX: number,
      initialY: number
    ): TouchPosition => {
      // Calculate relative position from initial touch
      const deltaX = touchX - initialX;
      const deltaY = touchY - initialY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Apply dead zone (snap to center if within dead zone)
      if (distance < DEAD_ZONE_RADIUS) {
        return { x: 0, y: 0 };
      }

      // Normalize to joystick radius (clamp at max radius)
      const normalizedDistance = Math.min(distance, MAX_RADIUS) / MAX_RADIUS;

      // Calculate direction angle
      // Note: Invert deltaY because screen coordinates have Y increasing downward,
      // but game coordinates have Y increasing upward
      const angle = Math.atan2(-deltaY, deltaX);

      // Convert to -1 to 1 range
      const x = Math.cos(angle) * normalizedDistance;
      const y = Math.sin(angle) * normalizedDistance;

      return { x, y };
    };

    const handleTouchStart = (event: TouchEvent) => {
      // Check if touch target is a UI element (button, link, etc.)
      const target = event.target as HTMLElement;
      const isUIElement =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.closest('[role="button"]') !== null ||
        target.closest('[data-ui-element="true"]') !== null ||
        // Check if target is inside a menu container
        target.closest("[data-menu-container]") !== null;

      // Only prevent default if NOT touching a UI element
      // This allows buttons to receive click events
      if (!isUIElement) {
        event.preventDefault();
      }

      // Only process touch for joystick if not on UI element
      if (
        !isUIElement &&
        activeTouchIdRef.current === null &&
        event.touches.length > 0
      ) {
        const touch = event.touches.item(0);
        if (touch) {
          activeTouchIdRef.current = touch.identifier;

          // Store initial touch position (joystick center)
          const initialX = touch.clientX;
          const initialY = touch.clientY;
          initialTouchRef.current = { x: initialX, y: initialY };
          joystickCenterRef.current = { x: initialX, y: initialY };

          // Initialize input (will be updated on touchmove)
          inputRef.current = { x: 0, y: 0 };
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Only prevent default if we have an active joystick touch
      if (activeTouchIdRef.current !== null) {
        event.preventDefault();
      }

      if (
        activeTouchIdRef.current === null ||
        initialTouchRef.current === null
      ) {
        return;
      }

      // Find the active touch
      const activeTouch = Array.from(event.touches).find(
        (t) => t.identifier === activeTouchIdRef.current
      );

      if (!activeTouch) {
        return;
      }

      // Normalize touch input
      const normalized = normalizeTouchInput(
        activeTouch.clientX,
        activeTouch.clientY,
        initialTouchRef.current.x,
        initialTouchRef.current.y
      );

      inputRef.current = normalized;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      // Only prevent default if we have an active joystick touch
      if (activeTouchIdRef.current !== null) {
        event.preventDefault();
      }

      if (activeTouchIdRef.current === null) {
        return;
      }

      // Check if active touch still exists
      const activeTouchStillExists = Array.from(event.touches).some(
        (t) => t.identifier === activeTouchIdRef.current
      );

      if (!activeTouchStillExists) {
        // Active touch ended, reset to keyboard input
        activeTouchIdRef.current = null;
        initialTouchRef.current = null;
        joystickCenterRef.current = null;
        inputRef.current = { x: 0, y: 0 };
      }
    };

    const handleTouchCancel = (event: TouchEvent) => {
      // Treat touch cancel same as touch end
      handleTouchEnd(event);
    };

    // Add touch event listeners
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });

    return () => {
      // Cleanup event listeners
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);

      // Reset state
      activeTouchIdRef.current = null;
      initialTouchRef.current = null;
      joystickCenterRef.current = null;
      inputRef.current = { x: 0, y: 0 };
    };
  }, [enabled]);

  return inputRef;
};
