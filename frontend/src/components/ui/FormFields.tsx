import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={uid} className="text-xs font-semibold tracking-widest uppercase text-surface-300 font-body">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={uid}
          rows={3}
          className={cn(
            "w-full bg-surface-800 border rounded-xl text-surface-50 placeholder-surface-500",
            "px-4 py-2.5 text-sm font-body outline-none transition-all resize-none",
            "focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15",
            error ? "border-danger-500/60" : "border-surface-600 hover:border-surface-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ── Select ───────────────────────────────────────────────────────────────────

interface SelectOption { value: string | number; label: string }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={uid} className="text-xs font-semibold tracking-widest uppercase text-surface-300 font-body">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={uid}
          className={cn(
            "w-full bg-surface-800 border rounded-xl text-surface-50",
            "px-4 py-2.5 text-sm font-body outline-none transition-all appearance-none cursor-pointer",
            "focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15",
            error ? "border-danger-500/60" : "border-surface-600 hover:border-surface-500",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface-800">
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
