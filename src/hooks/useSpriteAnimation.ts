import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ANIMATION_MAPS } from "../data/config/animationMaps";

type AnimationType = string;

export const useSpriteAnimation = (
  category: "characters" | "enemies" | "weapons",
  variant: string,
  currentAnimation: AnimationType
) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const timer = useRef(0);

  // Get configuration from typed maps
  const categoryData = ANIMATION_MAPS[category];
  const variantData = categoryData?.[variant] || categoryData?.default;
  const config = variantData?.[currentAnimation] || variantData?.idle;

  useFrame((_state, delta) => {
    if (!config) return;

    // Don't animate if frameRate is 0
    if (config.frameRate === 0) return;

    timer.current += delta;
    const interval = 1 / config.frameRate;

    if (timer.current >= interval) {
      timer.current = 0;
      setFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= config.frames.length) {
          return config.loop ? 0 : prev;
        }
        return next;
      });
    }
  });

  // Reset frame when animation type changes
  useEffect(() => {
    setFrameIndex(0);
    timer.current = 0;
  }, [currentAnimation]);

  return config?.frames[frameIndex] || 0;
};
