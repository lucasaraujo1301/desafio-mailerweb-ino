import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 gap-4 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-500">
        {icon}
      </div>
      <div>
        <p className="text-surface-200 font-display font-semibold text-base">{title}</p>
        {description && <p className="text-surface-400 text-sm font-body mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-surface-800 rounded-xl animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-surface-700 rounded flex-1" style={{ opacity: 1 - j * 0.15 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-50">{title}</h1>
        {subtitle && <p className="text-sm text-surface-400 font-body mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
