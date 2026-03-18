import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/schema", () => ({
  user: { id: "id" },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

const mockGetUserById = vi.fn(() => Promise.resolve(null));
vi.mock("@/lib/queries/users", () => ({
  listUsers: vi.fn(() => Promise.resolve([])),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
  updateUser: vi.fn(() =>
    Promise.resolve({ id: "u1", name: "Admin", email: "a@b.com", role: "editor" })
  ),
  deleteUser: vi.fn(() => Promise.resolve()),
}));

import { GET, PUT, DELETE } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
    mockGetUserById.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/users");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    mockGetUserById.mockResolvedValueOnce({ id: "1", role: "admin" } as never);
    const req = new Request("http://localhost/api/admin/users");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });
});

describe("DELETE /api/admin/users", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
    mockGetUserById.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/users?id=u2", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when trying to delete own account", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "u1" } } as never);
    mockGetUserById.mockResolvedValueOnce({ id: "u1", role: "admin" } as never);
    const req = new Request("http://localhost/api/admin/users?id=u1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Cannot delete");
  });
});

describe("PUT /api/admin/users", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "u1", role: "editor" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });
});
