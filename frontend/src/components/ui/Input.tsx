import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftEl?: React.ReactNode;
  rightEl?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftEl, rightEl, className, id, ...props }, ref) => {
    const uid = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={uid} className="text-xs font-semibold tracking-widest uppercase text-surface-300 font-body select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftEl && (
            <span className="absolute left-3.5 text-surface-400 pointer-events-none">{leftEl}</span>
          )}
          <input
            ref={ref}
            id={uid}
            className={cn(
              "w-full bg-surface-800 border rounded-xl text-surface-50 placeholder-surface-500",
              "px-4 py-2.5 text-sm font-body outline-none transition-all",
              "focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15",
              error ? "border-danger-500/60 focus:ring-danger-500/15" : "border-surface-600 hover:border-surface-500",
              leftEl && "pl-10",
              rightEl && "pr-10",
              className
            )}
            {...props}
          />
          {rightEl && (
            <span className="absolute right-3.5 text-surface-400">{rightEl}</span>
          )}
        </div>
        {error && <p className="text-xs text-danger-400 font-body">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-400 font-body">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
