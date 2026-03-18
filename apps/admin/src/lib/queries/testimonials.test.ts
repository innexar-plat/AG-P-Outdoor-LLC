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

import { listTestimonials, listApprovedTestimonials, getTestimonialById } from "./testimonials";

describe("listTestimonials", () => {
  beforeEach(() => {
    mockOrderByRows = [{ id: 1, name: "John" }];
  });

  it("returns array of testimonials", async () => {
    const result = await listTestimonials();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("listApprovedTestimonials", () => {
  beforeEach(() => {
    mockOrderByRows = [{ id: 1, approved: true }];
  });

  it("returns array of approved testimonials", async () => {
    const result = await listApprovedTestimonials();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getTestimonialById", () => {
  beforeEach(() => {
    mockWhereLimitRows = [{ id: 1, name: "John" }];
  });

  it("returns testimonial when found", async () => {
    const result = await getTestimonialById(1);
    expect(result).toMatchObject({ id: 1, name: "John" });
  });

  it("returns null when not found", async () => {
    mockWhereLimitRows = [];
    const result = await getTestimonialById(999);
    expect(result).toBe(null);
  });
});
