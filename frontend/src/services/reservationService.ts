import api from "./api";
import type { Reservation, ReservationPayload, ReservationPatchPayload, PaginatedResponse } from "@/types";

export const reservationService = {
  async getAll(): Promise<Reservation[]> {
    const { data } = await api.get<PaginatedResponse<Reservation>>("/api/reservation/");
    return data.results;
  },

  async getById(id: number): Promise<Reservation> {
    const { data } = await api.get<Reservation>(`/api/reservation/${id}/`);
    return data;
  },

  async create(payload: ReservationPayload): Promise<Reservation> {
    const { data } = await api.post<Reservation>("/api/reservation/", payload);
    return data;
  },

  async update(id: number, payload: ReservationPayload): Promise<Reservation> {
    const { data } = await api.put<Reservation>(`/api/reservation/${id}/`, payload);
    return data;
  },

  async patch(id: number, payload: ReservationPatchPayload): Promise<Reservation> {
    const { data } = await api.patch<Reservation>(`/api/reservation/${id}/`, payload);
    return data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/api/reservation/${id}/`);
  },
};