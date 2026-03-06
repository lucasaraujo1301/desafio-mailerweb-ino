"use client";

import { useCallback, useEffect, useState } from "react";
import { roomService } from "@/services/roomService";
import type { Room, RoomPayload } from "@/types";
import { extractApiError } from "@/lib/utils";
import toast from "react-hot-toast";

export function useRooms() {
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRooms(await roomService.getAll());
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (payload: RoomPayload) => {
    const room = await roomService.create(payload);
    setRooms((p) => [...p, room]);
    toast.success("Sala criada com sucesso!");
    return room;
  };

  const update = async (id: number, payload: RoomPayload) => {
    const updated = await roomService.update(id, payload);
    setRooms((p) => p.map((r) => (r.id === id ? updated : r)));
    toast.success("Sala atualizada!");
    return updated;
  };

  const remove = async (id: number) => {
    await roomService.remove(id);
    setRooms((p) => p.filter((r) => r.id !== id));
    toast.success("Sala removida.");
  };

  return { rooms, loading, error, load, create, update, remove };
}
