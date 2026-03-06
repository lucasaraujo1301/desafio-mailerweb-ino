import MockAdapter from "axios-mock-adapter";
import api from "@/services/api";
import { roomService } from "@/services/roomService";
import type { Room } from "@/types";

const mock = new MockAdapter(api);

const ROOM: Room = {
  id: 1,
  name: "Sala Alpha",
  capacity: 10,
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

beforeEach(() => mock.reset());

describe("roomService", () => {
  it("getAll returns array of rooms", async () => {
    mock.onGet("/api/rooms/").reply(200, { count: 1, next: null, previous: null, results: [ROOM] });
    const rooms = await roomService.getAll();
    expect(rooms).toHaveLength(1);
    expect(rooms[0].name).toBe("Sala Alpha");
  });

  it("getById returns single room", async () => {
    mock.onGet("/api/rooms/1/").reply(200, ROOM);
    const r = await roomService.getById(1);
    expect(r.id).toBe(1);
  });

  it("create sends POST with name and capacity only", async () => {
    let captured: unknown;
    mock.onPost("/api/rooms/").reply((config) => {
      captured = JSON.parse(config.data);
      return [201, { ...ROOM, id: 2 }];
    });
    await roomService.create({ name: "Nova Sala", capacity: 5 });
    expect(captured).toEqual({ name: "Nova Sala", capacity: 5 });
  });

  it("create returns created room", async () => {
    mock.onPost("/api/rooms/").reply(201, { ...ROOM, id: 2 });
    const r = await roomService.create({ name: "Nova Sala", capacity: 5 });
    expect(r.id).toBe(2);
  });

  it("update sends PUT and returns updated room", async () => {
    mock.onPut("/api/rooms/1/").reply(200, { ...ROOM, name: "Sala Editada", capacity: 15 });
    const r = await roomService.update(1, { name: "Sala Editada", capacity: 15 });
    expect(r.name).toBe("Sala Editada");
    expect(r.capacity).toBe(15);
  });

  it("patch sends PATCH", async () => {
    mock.onPatch("/api/rooms/1/").reply(200, { ...ROOM, capacity: 20 });
    const r = await roomService.patch(1, { capacity: 20 });
    expect(r.capacity).toBe(20);
  });

  it("remove sends DELETE", async () => {
    mock.onDelete("/api/rooms/1/").reply(204);
    await expect(roomService.remove(1)).resolves.toBeUndefined();
  });

  it("getAll throws on server error", async () => {
    mock.onGet("/api/rooms/").reply(500);
    await expect(roomService.getAll()).rejects.toThrow();
  });
});
