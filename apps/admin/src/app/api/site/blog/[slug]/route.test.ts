import { describe, it, expect, vi, beforeEach } from "vitest";

let mockBlogPost: unknown = null;

vi.mock("@/lib/queries/blog", () => ({
  getBlogPostBySlug: vi.fn(() => Promise.resolve(mockBlogPost)),
}));

import { GET } from "./route";

describe("GET /api/site/blog/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when post not found", async () => {
    mockBlogPost = null;
    const req = new Request("https://example.com/api/site/blog/missing");
    const res = await GET(req, { params: Promise.resolve({ slug: "missing" }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns 200 with post when found", async () => {
    mockBlogPost = { id: 1, slug: "my-post", title: "My Post", status: "published" };
    const req = new Request("https://example.com/api/site/blog/my-post");
    const res = await GET(req, { params: Promise.resolve({ slug: "my-post" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ slug: "my-post", title: "My Post" });
  });
});
