import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/seo", () => ({
  listPageSeo: vi.fn(() => Promise.resolve([])),
  upsertPageSeo: vi.fn((data: { pageKey: string }) =>
    Promise.resolve({ pageKey: data.pageKey, titleTag: "T", metaDescription: "D", ogImage: null })
  ),
}));

import { GET, PUT } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("GET /api/admin/seo", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/seo");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/seo");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });
});

describe("PUT /api/admin/seo", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageKey: "home" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 on missing pageKey", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleTag: "Test" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("upserts SEO data and returns 200", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageKey: "home", titleTag: "Home Title" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.pageKey).toBe("home");
  });
});
