import { describe, it, expect, vi, beforeEach } from "vitest";

let mockSelectResult: unknown[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(mockSelectResult),
          orderBy: () => Promise.resolve(mockSelectResult),
        }),
        orderBy: () => Promise.resolve(mockSelectResult),
      }),
    }),
  },
}));

import { listBanners, getBannerById, listActiveBanners } from "./banners";

describe("listBanners", () => {
  beforeEach(() => {
    mockSelectResult = [{ id: 1, title: "Banner" }];
  });

  it("returns array of banners", async () => {
    const result = await listBanners();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getBannerById", () => {
  beforeEach(() => {
    mockSelectResult = [{ id: 1, title: "Banner" }];
  });

  it("returns banner when found", async () => {
    const result = await getBannerById(1);
    expect(result).toMatchObject({ id: 1, title: "Banner" });
  });

  it("returns null when not found", async () => {
    mockSelectResult = [];
    const result = await getBannerById(999);
    expect(result).toBe(null);
  });
});

describe("listActiveBanners", () => {
  beforeEach(() => {
    mockSelectResult = [{ id: 1, placement: "dashboard" }];
  });

  it("returns array of banners for placement", async () => {
    const result = await listActiveBanners("dashboard");
    expect(Array.isArray(result)).toBe(true);
  });
});
