import type { ButtonHTMLAttributes, ReactNode } from "react";
import styled from "@emotion/styled";

type ButtonVariant = "primary" | "disabled" | "outline" | "success" | "compact";

interface AppButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const StyledButton = styled.button<{ variant: ButtonVariant; $disabled?: boolean }>`
  padding: 8px 16px;
  font-size: 32px;
  background: #444;
  color: white;
  border: 2px solid #666;
  cursor: pointer;
  border-radius: 8px;
  text-align: right;
  direction: rtl;

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
        `;
      case "success":
        return `
          padding: 10px 18px;
          background: #4caf50;
          border: none;
          font-weight: 600;
          font-size: 32px;
        `;
      case "compact":
        return `
          padding: 10px;
          font-size: 16px;
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
    <StyledButton variant={variant} $disabled={!!disabled} disabled={disabled} {...rest}>
      {children}
    </StyledButton>
  );
};
