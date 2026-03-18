import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/social", () => ({
  getSocialPostById: vi.fn(() => Promise.resolve({ id: 1 })),
  updateSocialPost: vi.fn(() => Promise.resolve({ id: 1, title: "Updated" })),
  deleteSocialPost: vi.fn(() => Promise.resolve()),
}));

import { PUT, DELETE } from "./route";
import { auth } from "@/lib/auth";
import { getSocialPostById } from "@/lib/queries/social";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetById = vi.mocked(getSocialPostById);

describe("PUT /api/admin/social/[id]", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
    mockGetById.mockResolvedValue({ id: 1 } as never);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/social/1", { method: "PUT" });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is invalid", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/social/abc", { method: "PUT" });
    const res = await PUT(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 when post not found", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    mockGetById.mockResolvedValueOnce(null as never);
    const req = new Request("http://localhost/api/admin/social/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 when post is updated", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    mockGetById.mockResolvedValueOnce({ id: 1 } as never);
    const req = new Request("http://localhost/api/admin/social/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(1);
  });
});
