"use client";

import React, { useState } from "react";
import { useReservations } from "@/hooks/useReservations";
import { useRooms }        from "@/hooks/useRooms";
import { ReservationsTable }   from "@/components/reservations/ReservationsTable";
import { ReservationFormModal } from "@/components/reservations/ReservationFormModal";
import { ConfirmDialog }   from "@/components/ui/ConfirmDialog";
import { Button }          from "@/components/ui/Button";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui/PageParts";
import { extractApiError } from "@/lib/utils";
import type { Reservation } from "@/types";
import { CalendarCheck2, Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function ReservationsPage() {
  const { reservations, loading, error, load, create, cancel } = useReservations();
  const { rooms } = useRooms();

  const [createOpen,    setCreateOpen]    = useState(false);
  const [cancelTarget,  setCancelTarget]  = useState<Reservation | null>(null);
  const [cancelling,    setCancelling]    = useState(false);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancel(cancelTarget.id);
      setCancelTarget(null);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reservas"
        subtitle="Gerencie todas as reservas de salas"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={load} disabled={loading} />
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Nova Reserva
            </Button>
          </div>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : error ? (
        <div className="bg-danger-500/10 border border-danger-500/20 rounded-2xl p-6 text-center">
          <p className="text-danger-400 font-body text-sm">{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={load}>Tentar novamente</Button>
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck2 size={28} />}
          title="Nenhuma reserva encontrada"
          description="Crie uma nova reserva para uma sala disponível."
          action={
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Nova Reserva
            </Button>
          }
        />
      ) : (
        <div className="bg-surface-900 border border-surface-700/40 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 pt-5 pb-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-surface-400 font-body">
              {reservations.length} reserva{reservations.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="px-6 pb-4">
            <ReservationsTable
              reservations={reservations}
              onCancel={setCancelTarget}
            />
          </div>
        </div>
      )}

      <ReservationFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={create}
        rooms={rooms}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancelar reserva"
        message={`Cancelar "${cancelTarget?.title}"? Todos os participantes serão notificados e a reserva será cancelada para todos.`}
        confirmLabel="Cancelar reserva"
      />
    </>
  );
}
