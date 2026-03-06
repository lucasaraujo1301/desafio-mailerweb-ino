"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { extractApiError } from "@/lib/utils";
import type { Room, RoomPayload } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
  name:     z.string().min(1, "Nome obrigatório").max(120),
  capacity: z.number({ invalid_type_error: "Capacidade obrigatória" }).int().min(1, "Mín. 1"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (p: RoomPayload) => Promise<unknown>;
  room?: Room;
}

export function RoomFormModal({ open, onClose, onSave, room }: Props) {
  const isEdit = !!room;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: room ? { name: room.name, capacity: room.capacity } : {},
  });

  const close = () => { reset(); onClose(); };

  const onSubmit = async (v: FormValues) => {
    try {
      await onSave({ name: v.name, capacity: v.capacity });
      close();
    } catch (e) {
      toast.error(extractApiError(e));
    }
  };

  return (
    <Modal open={open} onClose={close} title={isEdit ? "Editar Sala" : "Nova Sala"} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          placeholder="Ex: Sala Orion"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Capacidade"
          type="number"
          placeholder="10"
          error={errors.capacity?.message}
          {...register("capacity", { valueAsNumber: true })}
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={close} className="flex-1" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {isEdit ? "Salvar" : "Criar sala"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
