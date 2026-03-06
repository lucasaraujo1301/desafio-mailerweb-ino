// Mock js-cookie BEFORE any imports that use it
const cookieStore: Record<string, string> = {};
jest.mock("js-cookie", () => ({
  get:    (k: string) => cookieStore[k],
  set:    (k: string, v: string) => { cookieStore[k] = v; },
  remove: (k: string) => { delete cookieStore[k]; },
}));

// Mock window.location to suppress jsdom navigation errors
Object.defineProperty(window, "location", {
  value: { href: "" },
  writable: true,
});

import MockAdapter from "axios-mock-adapter";
import api, { TOKEN_KEY, storeToken, clearToken, getStoredToken } from "@/services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
  Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
});

describe("httpClient / api.ts", () => {
  it("attaches Authorization header when token exists", async () => {
    storeToken("my-token");
    let capturedAuth: string | undefined;
    mock.onGet("/test").reply((config) => {
      capturedAuth = config.headers?.Authorization;
      return [200, {}];
    });
    await api.get("/test");
    expect(capturedAuth).toBe("Bearer my-token");
  });

  it("does not attach Authorization when no token", async () => {
    let capturedAuth: string | undefined;
    mock.onGet("/test").reply((config) => {
      capturedAuth = config.headers?.Authorization;
      return [200, {}];
    });
    await api.get("/test");
    expect(capturedAuth).toBeUndefined();
  });

  it("storeToken saves to cookie", () => {
    storeToken("tok123");
    expect(cookieStore[TOKEN_KEY]).toBe("tok123");
  });

  it("clearToken removes from cookie", () => {
    cookieStore[TOKEN_KEY] = "exists";
    clearToken();
    expect(cookieStore[TOKEN_KEY]).toBeUndefined();
  });

  it("getStoredToken returns stored value", () => {
    cookieStore[TOKEN_KEY] = "abc";
    expect(getStoredToken()).toBe("abc");
  });
});