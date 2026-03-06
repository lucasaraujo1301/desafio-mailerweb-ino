import React from "react";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types";

type BadgeVariant = "brand" | "success" | "danger" | "warn" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantCls: Record<BadgeVariant, { wrap: string; dot: string }> = {
  brand:   { wrap: "bg-brand-500/15 text-brand-300 border-brand-500/30",      dot: "bg-brand-400" },
  success: { wrap: "bg-success-500/15 text-success-400 border-success-500/30", dot: "bg-success-400" },
  danger:  { wrap: "bg-danger-500/15 text-danger-400 border-danger-500/30",   dot: "bg-danger-400" },
  warn:    { wrap: "bg-warn-500/15 text-warn-400 border-warn-500/30",          dot: "bg-warn-400" },
  neutral: { wrap: "bg-surface-700 text-surface-300 border-surface-600",       dot: "bg-surface-400" },
};

export function Badge({ children, variant = "neutral", dot, className }: BadgeProps) {
  const { wrap, dot: dotCls } = variantCls[variant];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-body", wrap, className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotCls)} />}
      {children}
    </span>
  );
}

const statusMap: Record<ReservationStatus, { label: string; variant: BadgeVariant }> = {
  active:   { label: "Ativa",     variant: "success" },
  canceled: { label: "Cancelada", variant: "danger"  },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { label, variant } = statusMap[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}