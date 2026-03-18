import { describe, it, expect, vi, beforeEach } from "vitest";

let mockOrderByRows: { id: string; name: string; email: string; role: string }[] = [];
let mockWhereLimitRows: { id: string; name: string; email: string; role: string }[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    select: (cols?: unknown) => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(mockWhereLimitRows),
        }),
        orderBy: () => Promise.resolve(mockOrderByRows),
      }),
    }),
  },
}));

import { listUsers, getUserById } from "./users";

describe("listUsers", () => {
  beforeEach(() => {
    mockOrderByRows = [
      { id: "1", name: "Admin", email: "a@x.com", role: "admin" },
      { id: "2", name: "Editor", email: "e@x.com", role: "editor" },
    ];
  });

  it("returns array of users", async () => {
    const result = await listUsers();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: "1", name: "Admin", role: "admin" });
  });
});

describe("getUserById", () => {
  beforeEach(() => {
    mockWhereLimitRows = [
      { id: "u1", name: "Test", email: "t@x.com", role: "admin" },
    ];
  });

  it("returns user when found", async () => {
    const result = await getUserById("u1");
    expect(result).not.toBeNull();
    expect(result).toMatchObject({ id: "u1", role: "admin" });
  });

  it("returns null when not found", async () => {
    mockWhereLimitRows = [];
    const result = await getUserById("missing");
    expect(result).toBe(null);
  });
});
