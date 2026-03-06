import MockAdapter from "axios-mock-adapter";
import api from "@/services/api";
import { reservationService } from "@/services/reservationService";
import type { Reservation } from "@/types";

const mock = new MockAdapter(api);

const RES: Reservation = {
  id: 1,
  title: "Daily",
  room: 1,
  users: [1, 2],
  start_datetime: "2025-01-10T09:00:00Z",
  end_datetime:   "2025-01-10T10:00:00Z",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  status: "active"
};

beforeEach(() => mock.reset());

describe("reservationService", () => {
  it("getAll returns list", async () => {
    mock.onGet("/api/reservation/").reply(200, { count: 1, next: null, previous: null, results: [RES] });
    const list = await reservationService.getAll();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Daily");
  });

  it("getById returns reservation", async () => {
    mock.onGet("/api/reservation/1/").reply(200, RES);
    const r = await reservationService.getById(1);
    expect(r.is_active).toBe(true);
  });

  it("create sends POST with correct fields", async () => {
    const payload = {
      title: "Sprint Review",
      room: 1,
      start_datetime: "2025-01-11T14:00:00Z",
      end_datetime:   "2025-01-11T15:00:00Z",
    };
    mock.onPost("/api/reservation/").reply(201, { ...RES, ...payload, id: 5 });
    const r = await reservationService.create(payload);
    expect(r.id).toBe(5);
    expect(r.title).toBe("Sprint Review");
  });

  it("create payload uses start_datetime / end_datetime (not start_time)", async () => {
    let captured: unknown;
    mock.onPost("/api/reservation/").reply((config) => {
      captured = JSON.parse(config.data);
      return [201, RES];
    });
    await reservationService.create({
      title: "Test",
      room: 1,
      start_datetime: "2025-01-11T14:00:00Z",
      end_datetime:   "2025-01-11T15:00:00Z",
    });
    expect(captured).toHaveProperty("start_datetime");
    expect(captured).toHaveProperty("end_datetime");
    expect(captured).not.toHaveProperty("start_time");
    expect(captured).not.toHaveProperty("end_time");
  });

  it("cancel sends DELETE", async () => {
    mock.onDelete("/api/reservation/1/").reply(204);
    await expect(reservationService.cancel(1)).resolves.toBeUndefined();
  });

  it("getAll throws on server error", async () => {
    mock.onGet("/api/reservation/").reply(500);
    await expect(reservationService.getAll()).rejects.toThrow();
  });
});
