import type { RefObject } from "react";

/**
 * Parameters for useMenuNavigation hook
 * Enables arrow-key navigation between focusable buttons inside a container.
 */
export interface UseMenuNavigationParams {
  containerRef: RefObject<HTMLElement>;
  isActive: boolean;
  focusKey?: unknown;
}
