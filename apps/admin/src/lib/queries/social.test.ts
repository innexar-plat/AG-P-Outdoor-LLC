import { describe, it, expect, vi, beforeEach } from "vitest";

let mockOrderByRows: unknown[] = [];
let mockWhereLimitRows: unknown[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        orderBy: () => Promise.resolve(mockOrderByRows),
        where: () => ({
          limit: () => Promise.resolve(mockWhereLimitRows),
        }),
      }),
    }),
  },
}));

import { listSocialPosts, getSocialPostById } from "./social";

describe("listSocialPosts", () => {
  beforeEach(() => {
    mockOrderByRows = [{ id: 1, platform: "youtube" }];
  });

  it("returns array of posts", async () => {
    const result = await listSocialPosts();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });
});

describe("getSocialPostById", () => {
  beforeEach(() => {
    mockWhereLimitRows = [{ id: 1, platform: "youtube" }];
  });

  it("returns post when found", async () => {
    const result = await getSocialPostById(1);
    expect(result).toMatchObject({ id: 1, platform: "youtube" });
  });

  it("returns null when not found", async () => {
    mockWhereLimitRows = [];
    const result = await getSocialPostById(999);
    expect(result).toBe(null);
  });
});
