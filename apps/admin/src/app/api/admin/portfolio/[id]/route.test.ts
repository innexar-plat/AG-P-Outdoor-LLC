import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockGetPortfolioItemById = vi.fn();
const mockUpdatePortfolioItem = vi.fn();
const mockDeletePortfolioItem = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.mock("@/lib/queries/portfolio", () => ({
  getPortfolioItemById: (id: number) => mockGetPortfolioItemById(id),
  updatePortfolioItem: (...args: unknown[]) => mockUpdatePortfolioItem(...args),
  deletePortfolioItem: (...args: unknown[]) => mockDeletePortfolioItem(...args),
}));

import { PUT, DELETE } from "./route";

describe("PUT /api/admin/portfolio/[id]", () => {
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

  it("returns 404 when item not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetPortfolioItemById.mockResolvedValue(null);
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated item", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetPortfolioItemById.mockResolvedValue({ id: 1, title: "Old" });
    mockUpdatePortfolioItem.mockResolvedValue({ id: 1, title: "Updated" });
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ id: 1, title: "Updated" });
  });
});

describe("DELETE /api/admin/portfolio/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 200 with ok when deleted", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetPortfolioItemById.mockResolvedValue({ id: 1 });
    mockDeletePortfolioItem.mockResolvedValue(undefined);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual({ ok: true });
  });
});
