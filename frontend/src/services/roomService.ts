import api from "./api";
import type { Room, RoomPayload, PaginatedResponse } from "@/types";

export const roomService = {
  async getAll(): Promise<Room[]> {
    const { data } = await api.get<PaginatedResponse<Room>>("/api/rooms/");
    return data.results;
  },

  async getById(id: number): Promise<Room> {
    const { data } = await api.get<Room>(`/api/rooms/${id}/`);
    return data;
  },

  async create(payload: RoomPayload): Promise<Room> {
    const { data } = await api.post<Room>("/api/rooms/", payload);
    return data;
  },

  async update(id: number, payload: RoomPayload): Promise<Room> {
    const { data } = await api.put<Room>(`/api/rooms/${id}/`, payload);
    return data;
  },

  async patch(id: number, payload: Partial<RoomPayload>): Promise<Room> {
    const { data } = await api.patch<Room>(`/api/rooms/${id}/`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/rooms/${id}/`);
  },
};