import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockGetBlogPostById = vi.fn();
const mockUpdateBlogPost = vi.fn();
const mockDeleteBlogPost = vi.fn();

vi.mock("@/lib/schema", () => ({
  blogPosts: { id: "id" },
}));

vi.mock("@/lib/queries/blog", () => ({
  getBlogPostById: (...args: unknown[]) => mockGetBlogPostById(...args),
  updateBlogPost: (...args: unknown[]) => mockUpdateBlogPost(...args),
  deleteBlogPost: (...args: unknown[]) => mockDeleteBlogPost(...args),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

import { GET, PUT, DELETE } from "./route";

describe("GET /api/admin/blog/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/blog/1");
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when id is invalid", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    const req = new Request("http://localhost/api/admin/blog/abc");
    const res = await GET(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 when post not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBlogPostById.mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/blog/999");
    const res = await GET(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with post when found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBlogPostById.mockResolvedValue({ id: 1, title: "Post", slug: "post" });
    const req = new Request("http://localhost/api/admin/blog/1");
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ id: 1, title: "Post" });
  });
});

describe("PUT /api/admin/blog/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/blog/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when post not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBlogPostById.mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/blog/999", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated post", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBlogPostById.mockResolvedValue({ id: 1, title: "Old", status: "draft" });
    mockUpdateBlogPost.mockResolvedValue({ id: 1, title: "Updated" });
    const req = new Request("http://localhost/api/admin/blog/1", {
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

describe("DELETE /api/admin/blog/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/blog/1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 200 with ok when deleted", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetBlogPostById.mockResolvedValue({ id: 1 });
    mockDeleteBlogPost.mockResolvedValue(undefined);
    const req = new Request("http://localhost/api/admin/blog/1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual({ ok: true });
  });
});
