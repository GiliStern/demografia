import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "disabled" | "outline" | "success" | "compact";

interface AppButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
  style?: CSSProperties;
}

const BASE_STYLE: CSSProperties = {
  padding: "8px 16px",
  fontSize: "32px",
  background: "#444",
  color: "white",
  border: "2px solid #666",
  cursor: "pointer",
  borderRadius: "8px",
  textAlign: "right",
  direction: "rtl",
};

const VARIANT_STYLE: Record<ButtonVariant, CSSProperties> = {
  primary: {},
  disabled: {
    background: "#222",
    color: "#666",
    border: "2px solid #333",
    cursor: "not-allowed",
  },
  outline: {
    padding: "15px 40px",
    border: "2px solid white",
  },
  success: {
    padding: "10px 18px",
    background: "#4caf50",
    border: "none",
    fontWeight: 600,
    fontSize: "32px",
  },
  compact: {
    padding: "10px",
    fontSize: "16px",
  },
};

export const AppButton = ({
  children,
  variant = "primary",
  disabled,
  style,
  ...rest
}: AppButtonProps) => {
  const variantStyle =
    disabled && variant !== "disabled"
      ? VARIANT_STYLE.disabled
      : VARIANT_STYLE[variant];

  const finalStyle: CSSProperties = {
    ...BASE_STYLE,
    ...variantStyle,
    ...(style ?? {}),
  };

  return (
    <button {...rest} disabled={disabled} style={finalStyle}>
      {children}
    </button>
  );
};
