import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is a mobile/touch-capable device
 * Uses multiple detection methods for accuracy:
 * - Touch capability check (primary)
 * - Screen size check (secondary)
 * - User agent check (tertiary, for edge cases)
 * 
 * @returns boolean - true if mobile device detected
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Primary check: Touch capability
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      
      // Secondary check: Screen size (mobile typically < 768px width)
      const isSmallScreen = window.innerWidth < 768;
      
      // Tertiary check: User agent (for edge cases)
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Consider mobile if touch capable AND (small screen OR mobile UA)
      // This avoids false positives on desktop touch screens while catching mobile devices
      const mobile = hasTouch && (isSmallScreen || isMobileUA);
      
      setIsMobile(mobile);
    };

    // Initial check
    checkMobile();

    // Listen for resize events (handles orientation changes)
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return isMobile;
};
