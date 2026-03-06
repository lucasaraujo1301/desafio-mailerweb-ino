import { cn, formatDateTime, formatDate, formatTime, formatDateTimeLocal, extractApiError } from "@/lib/utils";

describe("cn (classnames merge)", () => {
  it("merges simple classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("resolves tailwind conflicts", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
  it("handles falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("formatDate", () => {
  it("formats ISO date to dd/MM/yyyy", () => {
    expect(formatDate("2025-03-15T12:00:00Z")).toMatch(/15\/03\/2025/);
  });
  it("returns original on invalid date", () => {
    expect(formatDate("invalid")).toBe("invalid");
  });
});

describe("formatTime", () => {
  it("extracts time from ISO", () => {
    const result = formatTime("2025-03-15T14:30:00Z");
    // allow for timezone differences
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("formatDateTimeLocal", () => {
  it("returns yyyy-MM-ddTHH:mm format", () => {
    const result = formatDateTimeLocal("2025-06-20T08:00:00Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
  it("returns empty on invalid", () => {
    expect(formatDateTimeLocal("bad")).toBe("");
  });
});

describe("extractApiError", () => {
  it("extracts detail field", () => {
    const err = { response: { data: { detail: "Not found." } } };
    expect(extractApiError(err)).toBe("Not found.");
  });
  it("extracts first array error", () => {
    const err = { response: { data: { email: ["This field is required."] } } };
    expect(extractApiError(err)).toBe("This field is required.");
  });
  it("falls back to message", () => {
    const err = { message: "Network Error" };
    expect(extractApiError(err)).toBe("Network Error");
  });
  it("returns default on unknown shape", () => {
    expect(extractApiError({})).toBe("Ocorreu um erro inesperado.");
  });
});
