import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/schema", () => ({
  banners: { id: "id", title: "title", placement: "placement" },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/banners", () => ({
  listBanners: vi.fn(() => Promise.resolve([])),
  createBanner: vi.fn(() =>
    Promise.resolve({ id: 1, title: "Test Banner", placement: "dashboard" })
  ),
}));

import { GET, POST } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("GET /api/admin/banners", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/banners");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/banners");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.error).toBeNull();
  });
});

describe("POST /api/admin/banners", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test",
        placement: "dashboard",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when title is missing", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placement: "dashboard" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when placement is invalid", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", placement: "invalid" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("creates a banner and returns 201 with the new banner", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Banner",
        placement: "dashboard",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(1);
    expect(json.error).toBeNull();
  });
});
