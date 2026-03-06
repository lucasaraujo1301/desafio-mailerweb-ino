// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // password is write_only — never returned by the API
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
}

export interface ProfilePatchPayload {
  name?: string;
  email?: string;
  password?: string;
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

// Fields from BaseModelSerializer: created_at, updated_at, is_active
// Fields from RoomSerializer: id, name, capacity
export interface Room {
  id: number;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomPayload {
  name: string;
  capacity: number;
}

// ─── Reservations ────────────────────────────────────────────────────────────

export type ReservationStatus = "active" | "canceled";

// Fields from BaseModelSerializer: created_at, updated_at, is_active
// Fields from ReservationSerializer:
//   room (write_only PK), room_detail (read_only)
//   users (write_only PKs), users_detail (read_only)
//   start_datetime, end_datetime, title, status
export interface Reservation {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  status: ReservationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // write_only on input, never returned
  room?: number;
  users?: number[];
  // read_only expanded objects
  room_detail?: Room;
  users_detail?: User[];
}

export interface ReservationPayload {
  title: string;
  room: number;           // write_only PK
  start_datetime: string;
  end_datetime: string;
  users?: number[];       // write_only PKs (optional — organizer added by backend)
}

export interface ReservationPatchPayload extends Partial<ReservationPayload> {}

// ─── API Helpers ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  detail?: string;
}

export interface ReservationPatchPayload extends Partial<ReservationPayload> {}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}