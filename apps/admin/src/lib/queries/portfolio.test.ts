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
          orderBy: () => Promise.resolve(mockOrderByRows),
        }),
      }),
    }),
  },
}));

import { listPortfolioItems, listVisiblePortfolioItems, getPortfolioItemById } from "./portfolio";

describe("listPortfolioItems", () => {
  beforeEach(() => {
    mockOrderByRows = [{ id: 1, title: "Project" }];
  });

  it("returns array of items", async () => {
    const result = await listPortfolioItems();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });
});

describe("listVisiblePortfolioItems", () => {
  beforeEach(() => {
    mockOrderByRows = [{ id: 1, visible: true }];
  });

  it("returns array of visible items", async () => {
    const result = await listVisiblePortfolioItems();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getPortfolioItemById", () => {
  beforeEach(() => {
    mockWhereLimitRows = [{ id: 1, title: "Project" }];
  });

  it("returns item when found", async () => {
    const result = await getPortfolioItemById(1);
    expect(result).toMatchObject({ id: 1, title: "Project" });
  });

  it("returns null when not found", async () => {
    mockWhereLimitRows = [];
    const result = await getPortfolioItemById(999);
    expect(result).toBe(null);
  });
});
