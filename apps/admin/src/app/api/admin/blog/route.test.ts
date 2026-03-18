import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/schema", () => ({
  blogPosts: { id: "id", title: "title", slug: "slug", content: "content", coverImage: "cover_image", metaTitle: "meta_title", metaDescription: "meta_description", status: "status", publishedAt: "published_at", createdAt: "created_at" },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/blog", () => ({
  listBlogPosts: vi.fn(() => Promise.resolve([])),
  createBlogPost: vi.fn(() =>
    Promise.resolve({ id: 1, title: "Test", slug: "test", status: "draft" })
  ),
}));

import { GET, POST } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("GET /api/admin/blog", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/blog");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/blog");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.error).toBeNull();
  });
});

describe("POST /api/admin/blog", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", slug: "test", content: "Body", status: "draft" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when title is missing", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "test", content: "Body", status: "draft" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("creates a post and returns 201 with the new post", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Post", slug: "test-post", content: "Body content", status: "draft" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(1);
    expect(json.error).toBeNull();
  });
});
