import { describe, it, expect, vi } from "vitest";

vi.mock("../db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([{ id: 1, title: "T", slug: "t", status: "published" }])
          ),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
  },
}));

import { listBlogPosts, getBlogPostById, getBlogPostBySlug } from "./blog";

describe("listBlogPosts", () => {
  it("returns array of posts", async () => {
    const result = await listBlogPosts({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getBlogPostById", () => {
  it("returns a post or null", async () => {
    const result = await getBlogPostById(1);
    expect(result === null || (typeof result === "object" && "id" in result)).toBe(true);
  });
});

describe("getBlogPostBySlug", () => {
  it("returns a post or null", async () => {
    const result = await getBlogPostBySlug("test");
    expect(result === null || (typeof result === "object" && "slug" in result)).toBe(true);
  });
});
