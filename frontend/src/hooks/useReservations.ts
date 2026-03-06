"use client";

import { useCallback, useEffect, useState } from "react";
import { reservationService } from "@/services/reservationService";
import type { Reservation, ReservationPayload } from "@/types";
import { extractApiError } from "@/lib/utils";
import toast from "react-hot-toast";

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReservations(await reservationService.getAll());
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (payload: ReservationPayload) => {
    const res = await reservationService.create(payload);
    setReservations((p) => [res, ...p]);
    toast.success("Reserva criada!");
    return res;
  };

  const cancel = async (id: number) => {
    await reservationService.cancel(id);
    // Reload list so status reflects "canceled" returned by backend
    await load();
    toast.success("Reserva cancelada para todos os participantes.");
  };


  return { reservations, loading, error, load, create, cancel };
}