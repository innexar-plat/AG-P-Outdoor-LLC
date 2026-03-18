import { describe, it, expect } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("returns em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2024-03-15T12:00:00Z"));
    expect(result).toMatch(/Mar.*15.*2024/);
  });

  it("formats ISO string", () => {
    const result = formatDate("2024-01-15T12:00:00Z");
    expect(result).toMatch(/Jan.*2024/);
  });
});
