import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium uppercase tracking-[0.15em] transition-all duration-300 focus:outline-none",
          {
            "text-xs px-5 py-2.5": size === "sm",
            "text-xs px-7 py-3.5": size === "md",
            "text-xs px-9 py-4": size === "lg",
          },
          className
        )}
        style={{
          backgroundColor:
            variant === "primary" ? "var(--accent)" :
            "transparent",
          color:
            variant === "primary" ? "var(--accent-contrast)" :
            "var(--text)",
          border:
            variant === "outline" ? "1px solid var(--border)" :
            variant === "ghost" ? "none" :
            "none",
        }}
        onMouseEnter={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--accent-hover)";
          } else if (variant === "outline") {
            e.currentTarget.style.backgroundColor = "var(--text)";
            e.currentTarget.style.color = "var(--bg)";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--accent)";
          } else if (variant === "outline") {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text)";
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
