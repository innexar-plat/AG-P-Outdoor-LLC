import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/schema", () => ({
  portfolioItems: { id: "id" },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/portfolio", () => ({
  listPortfolioItems: vi.fn(() => Promise.resolve([])),
  createPortfolioItem: vi.fn(() =>
    Promise.resolve({ id: 1, title: "Project", imageUrl: "https://img.test/a.jpg" })
  ),
}));

import { GET, POST } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("GET /api/admin/portfolio", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/portfolio");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/portfolio");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });
});

describe("POST /api/admin/portfolio", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "P", imageUrl: "https://img.test/a.jpg" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 on missing fields", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "no title" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates item and returns 201", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Project", imageUrl: "https://img.test/a.jpg" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe(1);
  });
});
