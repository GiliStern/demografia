import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = "button:not(:disabled)";

interface UseMenuNavigationParams {
  containerRef: RefObject<HTMLElement>;
  isActive: boolean;
  focusKey?: unknown;
}

/**
 * Enables arrow-key navigation between focusable buttons inside a container.
 * Focus is moved to the first button when the menu becomes active or when
 * focusKey changes (e.g., when the list of buttons changes).
 */
export const useMenuNavigation = ({
  containerRef,
  isActive,
  focusKey,
}: UseMenuNavigationParams) => {
  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;
    if (!container) return;

    const getFocusableButtons = () =>
      Array.from(
        container.querySelectorAll<HTMLButtonElement>(FOCUSABLE_SELECTOR)
      );

    const focusFirstButton = () => {
      const focusableButtons = getFocusableButtons();
      if (focusableButtons.length === 0) return;

      const activeElement = document.activeElement;
      const isFocusInside =
        activeElement instanceof HTMLElement &&
        container.contains(activeElement);

      if (!isFocusInside) {
        focusableButtons[0]?.focus();
      }
    };

    focusFirstButton();

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      const isPrev = key === "ArrowUp" || key === "ArrowLeft";
      const isNext = key === "ArrowDown" || key === "ArrowRight";

      if (!isPrev && !isNext) return;

      const focusableButtons = getFocusableButtons();
      if (focusableButtons.length === 0) return;

      const activeElement = document.activeElement;
      const currentIndex = focusableButtons.findIndex(
        (button) => button === activeElement
      );
      const direction = isPrev ? -1 : 1;
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + direction + focusableButtons.length) %
            focusableButtons.length;

      focusableButtons[nextIndex]?.focus();
      event.preventDefault();
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, isActive, focusKey]);
};
