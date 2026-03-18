import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockGetBannerById = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbDelete = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

const mockUpdateBanner = vi.fn();
const mockDeleteBanner = vi.fn();

vi.mock("@/lib/queries/banners", () => ({
  getBannerById: (id: number) => mockGetBannerById(id),
  updateBanner: (...args: unknown[]) => mockUpdateBanner(...args),
  deleteBanner: (...args: unknown[]) => mockDeleteBanner(...args),
}));

import { PUT, DELETE } from "./route";

describe("PUT /api/admin/banners/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is invalid", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 when banner not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBannerById.mockResolvedValue(null);
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated banner", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBannerById.mockResolvedValue({ id: 1, title: "Old" });
    mockUpdateBanner.mockResolvedValue({ id: 1, title: "Updated" });
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated Title" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ id: 1, title: "Updated" });
  });
});

describe("DELETE /api/admin/banners/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when banner not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBannerById.mockResolvedValue(null);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with ok when deleted", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBannerById.mockResolvedValue({ id: 1 });
    mockDeleteBanner.mockResolvedValue(undefined);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual({ ok: true });
  });
});
