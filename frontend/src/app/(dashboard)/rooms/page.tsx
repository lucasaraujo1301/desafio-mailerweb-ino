"use client";

import React, { useState } from "react";
import { useRooms }        from "@/hooks/useRooms";
import { useReservations } from "@/hooks/useReservations";
import { useAuth }         from "@/contexts/AuthContext";
import { RoomsTable }      from "@/components/rooms/RoomsTable";
import { RoomFormModal }   from "@/components/rooms/RoomFormModal";
import { ReservationFormModal } from "@/components/reservations/ReservationFormModal";
import { ConfirmDialog }   from "@/components/ui/ConfirmDialog";
import { Button }          from "@/components/ui/Button";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui/PageParts";
import { extractApiError } from "@/lib/utils";
import type { Room, RoomPayload } from "@/types";
import { DoorOpen, Plus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function RoomsPage() {
  const { isAdmin } = useAuth();
  const { rooms, loading, error, load, create, update, remove } = useRooms();
  const { create: createReservation } = useReservations();

  const [roomModal,    setRoomModal]    = useState<{ open: boolean; room?: Room }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [bookTarget,   setBookTarget]   = useState<Room | null>(null);

  const handleSaveRoom = async (payload: RoomPayload) => {
    if (roomModal.room) {
      await update(roomModal.room.id, payload);
    } else {
      await create(payload);
    }
    setRoomModal({ open: false });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      toast.error(extractApiError(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Salas"
        subtitle="Gerencie e reserve as salas disponíveis"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={load} disabled={loading} />
            {isAdmin && (
              <Button icon={<Plus size={16} />} onClick={() => setRoomModal({ open: true })}>
                Nova Sala
              </Button>
            )}
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
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<DoorOpen size={28} />}
          title="Nenhuma sala cadastrada"
          description={isAdmin ? "Crie a primeira sala para começar." : "Aguarde o administrador cadastrar as salas."}
          action={isAdmin ? (
            <Button icon={<Plus size={16} />} onClick={() => setRoomModal({ open: true })}>
              Nova Sala
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="bg-surface-900 border border-surface-700/40 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 pt-5 pb-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-surface-400 font-body">
              {rooms.length} sala{rooms.length !== 1 ? "s" : ""} encontrada{rooms.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="px-6 pb-4">
            <RoomsTable
              rooms={rooms}
              onEdit={(r) => setRoomModal({ open: true, room: r })}
              onDelete={setDeleteTarget}
              onBook={setBookTarget}
            />
          </div>
        </div>
      )}

      {/* Room create/edit modal */}
      <RoomFormModal
        open={roomModal.open}
        onClose={() => setRoomModal({ open: false })}
        onSave={handleSaveRoom}
        room={roomModal.room}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir sala"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />

      {/* Quick reservation from table */}
      <ReservationFormModal
        open={!!bookTarget}
        onClose={() => setBookTarget(null)}
        onSave={createReservation}
        rooms={rooms}
        defaultRoomId={bookTarget?.id}
      />
    </>
  );
}
