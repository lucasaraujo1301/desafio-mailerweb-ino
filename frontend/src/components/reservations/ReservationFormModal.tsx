"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { extractApiError, formatDateTimeLocal } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { Room, Reservation, ReservationPayload, User, PaginatedResponse } from "@/types";
import { X, UserPlus, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

const schema = z.object({
  title:          z.string().min(1, "Título obrigatório"),
  room:           z.number({ invalid_type_error: "Selecione uma sala" }).positive("Selecione uma sala"),
  start_datetime: z.string().min(1, "Horário de início obrigatório"),
  end_datetime:   z.string().min(1, "Horário de fim obrigatório"),
}).refine((d) => new Date(d.end_datetime) > new Date(d.start_datetime), {
  message: "Fim deve ser após o início",
  path: ["end_datetime"],
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (p: ReservationPayload) => Promise<unknown>;
  rooms: Room[];
  reservation?: Reservation;
  defaultRoomId?: number;
}

export function ReservationFormModal({ open, onClose, onSave, rooms, reservation, defaultRoomId }: Props) {
  const { user } = useAuth();
  const isEdit   = !!reservation;

  const [participants, setParticipants] = useState<User[]>([]);
  const [searchEmail,  setSearchEmail]  = useState("");
  const [searching,    setSearching]    = useState(false);
  const [foundUser,    setFoundUser]    = useState<User | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservation
      ? {
          title:          reservation.title,
          room:           reservation.room,
          start_datetime: formatDateTimeLocal(reservation.start_datetime),
          end_datetime:   formatDateTimeLocal(reservation.end_datetime),
        }
      : { room: defaultRoomId },
  });

  useEffect(() => {
    if (!open) return;
    if (reservation?.users_detail) {
      setParticipants(reservation.users_detail);
    } else if (user) {
      setParticipants([user]);
    }
  }, [open]);

  const close = () => {
    reset();
    setParticipants(user ? [user] : []);
    setFoundUser(null);
    setSearchEmail("");
    onClose();
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setFoundUser(null);
    try {
      const { data } = await api.get<PaginatedResponse<User>>(`/api/user/?email=${encodeURIComponent(searchEmail.trim())}`);
      const found = data.results[0];
      if (found?.email) {
        setFoundUser(found);
      } else {
        toast.error("Usuário não encontrado.");
      }
    } catch {
      toast.error("Erro ao buscar usuário.");
    } finally {
      setSearching(false);
    }
  };

  const addParticipant = (u: User) => {
    if (!participants.find((p) => p.id === u.id)) {
      setParticipants((prev) => [...prev, u]);
    }
    setFoundUser(null);
    setSearchEmail("");
  };

  const removeParticipant = (id: number) => {
    if (id === user?.id) {
      toast.error("Você não pode se remover da reserva.");
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const onSubmit = async (v: FormValues) => {
    try {
      await onSave({
        title:          v.title,
        room:           v.room,
        start_datetime: new Date(v.start_datetime).toISOString(),
        end_datetime:   new Date(v.end_datetime).toISOString(),
        users:          participants.map((p) => p.id),
      });
      close();
    } catch (e) {
      toast.error(extractApiError(e));
    }
  };

  const roomOptions = rooms
    .filter((r) => r.is_active)
    .map((r) => ({ value: r.id, label: r.name }));

  return (
    <Modal open={open} onClose={close} title={isEdit ? "Editar Reserva" : "Nova Reserva"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Título"
          placeholder="Ex: Reunião de equipe"
          error={errors.title?.message}
          {...register("title")}
        />

        <Controller
          control={control}
          name="room"
          render={({ field }) => (
            <Select
              label="Sala"
              placeholder="Selecione uma sala"
              options={roomOptions}
              error={errors.room?.message}
              value={field.value || ""}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Início" type="datetime-local" error={errors.start_datetime?.message} {...register("start_datetime")} />
          <Input label="Fim"    type="datetime-local" error={errors.end_datetime?.message}   {...register("end_datetime")} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-widest uppercase text-surface-300 font-body">
            Participantes
          </label>
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-surface-800 border border-surface-600 rounded-xl">
            {participants.map((p) => (
              <Badge key={p.id} variant="brand" className="flex items-center gap-1.5 pr-1">
                {p.name}
                {p.id !== user?.id ? (
                  <button type="button" onClick={() => removeParticipant(p.id)} className="hover:text-danger-400 transition-colors ml-0.5">
                    <X size={11} />
                  </button>
                ) : (
                  <span className="text-[10px] opacity-60 ml-0.5">(você)</span>
                )}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="E-mail do participante"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchUser(); } }}
              leftEl={<Search size={14} />}
            />
            <Button type="button" variant="secondary" size="sm" icon={<UserPlus size={14} />} loading={searching} onClick={searchUser}>
              Buscar
            </Button>
          </div>
          {foundUser && (
            <div className="flex items-center justify-between p-2.5 bg-surface-800 border border-surface-600 rounded-xl">
              <span className="text-sm text-surface-200">
                {foundUser.name} <span className="text-surface-400">({foundUser.email})</span>
              </span>
              <Button size="xs" type="button" onClick={() => addParticipant(foundUser)}>Adicionar</Button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={close} className="flex-1" disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">{isEdit ? "Salvar" : "Criar reserva"}</Button>
        </div>
      </form>
    </Modal>
  );
}
