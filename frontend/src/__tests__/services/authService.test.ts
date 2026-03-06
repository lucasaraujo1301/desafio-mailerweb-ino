import MockAdapter from "axios-mock-adapter";
import api, { TOKEN_KEY, getStoredToken, storeToken, clearToken } from "@/services/api";
import { authService } from "@/services/authService";

const mock = new MockAdapter(api);

const cookieStore: Record<string, string> = {};
jest.mock("js-cookie", () => ({
  get:    (key: string) => cookieStore[key],
  set:    (key: string, value: string) => { cookieStore[key] = value; },
  remove: (key: string) => { delete cookieStore[key]; },
}));

beforeEach(() => {
  mock.reset();
  Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
});

describe("authService", () => {
  it("login stores token and returns token response", async () => {
    mock.onPost("/api/user/token/").reply(200, { token: "abc123" });
    const res = await authService.login({ email: "a@b.com", password: "pass" });
    expect(res.token).toBe("abc123");
    expect(cookieStore[TOKEN_KEY]).toBe("abc123");
  });

  it("register returns user data (email, name — no password)", async () => {
    const user = { id: 1, name: "Ana", email: "ana@x.com", is_active: true, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" };
    mock.onPost("/api/user/create/").reply(201, user);
    const result = await authService.register({ name: "Ana", email: "ana@x.com", password: "123456" });
    expect(result.email).toBe("ana@x.com");
    expect(result.name).toBe("Ana");
  });

  it("getProfile returns user from /api/user/me/", async () => {
    const user = { id: 2, name: "Bob", email: "bob@x.com", is_active: true, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" };
    mock.onGet("/api/user/me/").reply(200, user);
    const result = await authService.getProfile();
    expect(result.email).toBe("bob@x.com");
  });

  it("logout clears token from cookies", () => {
    cookieStore[TOKEN_KEY] = "token";
    authService.logout();
    expect(cookieStore[TOKEN_KEY]).toBeUndefined();
  });

  it("login throws on 401", async () => {
    mock.onPost("/api/user/token/").reply(401, { detail: "Invalid credentials" });
    await expect(authService.login({ email: "x@x.com", password: "wrong" })).rejects.toThrow();
  });

  it("patchProfile sends PATCH to /api/user/me/", async () => {
    const updated = { id: 2, name: "Bob Novo", email: "bob@x.com", is_active: true, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" };
    mock.onPatch("/api/user/me/").reply(200, updated);
    const result = await authService.patchProfile({ name: "Bob Novo" });
    expect(result.name).toBe("Bob Novo");
  });
});
