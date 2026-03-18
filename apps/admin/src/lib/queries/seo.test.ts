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
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([{ pageKey: "home", titleTag: "Home" }]),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ pageKey: "home", titleTag: "Home" }]),
      }),
    }),
  },
}));

import { listPageSeo, getPageSeo, upsertPageSeo } from "./seo";

describe("listPageSeo", () => {
  beforeEach(() => {
    mockOrderByRows = [{ pageKey: "home", titleTag: "Home" }];
  });

  it("returns array of SEO records", async () => {
    const result = await listPageSeo();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getPageSeo", () => {
  beforeEach(() => {
    mockWhereLimitRows = [{ pageKey: "home", titleTag: "Home" }];
  });

  it("returns record when found", async () => {
    const result = await getPageSeo("home");
    expect(result).toMatchObject({ pageKey: "home", titleTag: "Home" });
  });

  it("returns null when not found", async () => {
    mockWhereLimitRows = [];
    const result = await getPageSeo("missing");
    expect(result).toBe(null);
  });
});

describe("upsertPageSeo", () => {
  it("returns row after upsert", async () => {
    const result = await upsertPageSeo({ pageKey: "home", titleTag: "Home" });
    expect(result).toMatchObject({ pageKey: "home", titleTag: "Home" });
  });
});
