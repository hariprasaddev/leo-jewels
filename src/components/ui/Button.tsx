import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(variants[variant], size === "sm" && "btn-sm", className)}
      {...props}
    >
      {children}
    </button>
  );
}
