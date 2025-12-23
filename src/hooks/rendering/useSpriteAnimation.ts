import { useState, useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { ANIMATIONS_BY_CATEGORY } from "@/data/config/animationMaps";
import { useGameStore } from "@/store/gameStore";
import type { UseSpriteAnimationProps } from "@/types/hooks/rendering";

/**
 * PERFORMANCE OPTIMIZED: Uses refs to avoid React re-renders on every animation frame
 * Only triggers React update when frame actually changes (batched)
 */
export const useSpriteAnimation = ({
  category,
  variant,
  currentAnimation,
}: UseSpriteAnimationProps) => {
  const { isPaused, isRunning } = useGameStore();
  const [, setFrameIndex] = useState(0);
  const frameIndexRef = useRef(0);
  const timer = useRef(0);
  const lastUpdateRef = useRef(0);

  // Get configuration from typed maps
  const categoryData = ANIMATIONS_BY_CATEGORY[category];
  const variantData = categoryData[variant];
  const config = variantData[currentAnimation] ?? variantData.idle;

  // Memoize frame update to avoid recreating function
  const updateFrame = useCallback(() => {
    if (!config) return;

    const nextIndex = frameIndexRef.current + 1;
    const newIndex =
      nextIndex >= config.frames.length
        ? config.loop
          ? 0
          : frameIndexRef.current
        : nextIndex;

    frameIndexRef.current = newIndex;

    // Only trigger React update if frame actually changed (debounced)
    const now = performance.now();
    if (now - lastUpdateRef.current > 16) {
      // ~60fps throttle
      setFrameIndex(newIndex);
      lastUpdateRef.current = now;
    }
  }, [config]);

  useFrame((_state, delta) => {
    if (!config || !isRunning || isPaused) return;

    // Don't animate if frameRate is 0
    if (config.frameRate === 0) return;

    timer.current += delta;
    const interval = 1 / config.frameRate;

    if (timer.current >= interval) {
      timer.current -= interval; // More accurate than resetting to 0
      updateFrame();
    }
  });

  // Reset frame when animation type changes
  useEffect(() => {
    frameIndexRef.current = 0;
    setFrameIndex(0);
    timer.current = 0;
    lastUpdateRef.current = 0;
  }, [currentAnimation]);

  return config?.frames[frameIndexRef.current] ?? 0;
};
