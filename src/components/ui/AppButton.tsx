import type { ButtonHTMLAttributes, ReactNode } from "react";
import styled from "@emotion/styled";

type ButtonVariant = "primary" | "disabled" | "outline" | "success" | "compact";

interface AppButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const StyledButton = styled.button<{
  variant: ButtonVariant;
  $disabled?: boolean;
}>`
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

  ${({ variant, $disabled }) => {
    if ($disabled && variant !== "disabled") {
      return `
        background: #222;
        color: #666;
        border: 2px solid #333;
        cursor: not-allowed;
      `;
    }

    switch (variant) {
      case "disabled":
        return `
          background: #222;
          color: #666;
          border: 2px solid #333;
          cursor: not-allowed;
        `;
      case "outline":
        return `
          padding: 15px 40px;
          border: 2px solid white;
          @media (max-width: 768px) {
            padding: 12px 24px;
          }
          @media (max-width: 480px) {
            padding: 10px 20px;
          }
        `;
      case "success":
        return `
          padding: 10px 18px;
          background: #4caf50;
          border: none;
          font-weight: 600;
          font-size: 32px;
          @media (max-width: 768px) {
            font-size: 24px;
            padding: 12px 20px;
          }
          @media (max-width: 480px) {
            font-size: 20px;
            padding: 10px 16px;
          }
        `;
      case "compact":
        return `
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
        `;
      default:
        return "";
    }
  }}
`;

export const AppButton = ({
  children,
  variant = "primary",
  disabled,
  ...rest
}: AppButtonProps) => {
  return (
    <StyledButton
      variant={variant}
      $disabled={!!disabled}
      disabled={disabled}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};
