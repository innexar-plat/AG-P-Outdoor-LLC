import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries/blog", () => ({
  listBlogPosts: vi.fn(() => Promise.resolve([{ id: 1, title: "Hello", slug: "hello", status: "published" }])),
}));

import { GET } from "./route";

describe("GET /api/site/blog", () => {
  it("returns published posts without auth", async () => {
    const req = new Request("http://localhost/api/site/blog");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.length).toBe(1);
  });
});
