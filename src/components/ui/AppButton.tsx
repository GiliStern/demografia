import type { ComponentProps, ReactNode } from "react";
import { styled } from "@linaria/react";

type ButtonVariant = "primary" | "disabled" | "outline" | "success" | "compact";

interface AppButtonProps extends ComponentProps<"button"> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export const StyledButton = styled("button")`
  padding: 8px 16px;
  font-size: 32px;
  background: #444;
  color: white;
  border: 2px solid #666;
  cursor: pointer;
  border-radius: 8px;
  text-align: right;
  direction: rtl;
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  pointer-events: auto;
  position: relative;
  z-index: 101;

  @media (max-width: 768px) {
    font-size: 24px;
    padding: 12px 20px;
    min-height: 48px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    padding: 10px 16px;
    min-height: 44px;
  }

  &:has([data-variant="disabled"]),
  &:disabled {
    background: #222;
    color: #666;
    border: 2px solid #333;
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:has([data-variant="outline"]) {
    padding: 15px 40px;
    border: 2px solid white;
    @media (max-width: 768px) {
      padding: 12px 24px;
    }
    @media (max-width: 480px) {
      padding: 10px 20px;
    }
  }

  &:has([data-variant="success"]) {
    padding: 10px 18px;
    background: #4caf50;
    border: none;
    font-weight: 600;
    font-size: 32px;
  }

  &:has([data-variant="compact"]) {
    padding: 10px;
    font-size: 16px;

    @media (max-width: 768px) {
      font-size: 14px;
      padding: 8px;
      min-height: 40px;
    }
    @media (max-width: 480px) {
      font-size: 12px;
      padding: 6px;
      min-height: 36px;
    }
  }
`;

export const AppButton = ({
  children,
  variant = "primary",
  disabled,
  ...rest
}: AppButtonProps) => {
  return (
    <StyledButton data-variant={variant} disabled={disabled} {...rest}>
      {children}
    </StyledButton>
  );
};
