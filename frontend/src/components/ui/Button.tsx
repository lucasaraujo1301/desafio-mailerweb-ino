import React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size    = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantCls: Record<Variant, string> = {
  primary:
    "bg-brand-500 hover:bg-brand-400 text-white shadow-glow-brand hover:shadow-lg font-semibold",
  secondary:
    "bg-surface-700 hover:bg-surface-600 text-surface-100 border border-surface-600 hover:border-surface-500",
  danger:
    "bg-danger-500 hover:bg-danger-400 text-white shadow-glow-danger font-semibold",
  ghost:
    "hover:bg-surface-800 text-surface-300 hover:text-surface-50",
  outline:
    "border border-brand-500/40 hover:border-brand-400 text-brand-300 hover:bg-brand-500/10",
};

const sizeCls: Record<Size, string> = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3.5 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-body font-medium",
        "transition-all duration-200 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        variantCls[variant],
        sizeCls[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
