"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message,
  confirmLabel = "Confirmar",
  loading,
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-danger-500/15 border border-danger-500/30 flex items-center justify-center">
          <AlertTriangle size={22} className="text-danger-400" />
        </div>
        <div>
          <h3 className="text-base font-display font-semibold text-surface-50 mb-1">{title}</h3>
          <p className="text-sm text-surface-300 font-body">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
