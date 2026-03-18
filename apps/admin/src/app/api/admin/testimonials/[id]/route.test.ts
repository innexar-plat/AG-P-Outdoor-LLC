import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockGetTestimonialById = vi.fn();
const mockUpdateTestimonial = vi.fn();
const mockDeleteTestimonial = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.mock("@/lib/queries/testimonials", () => ({
  getTestimonialById: (id: number) => mockGetTestimonialById(id),
  updateTestimonial: (...args: unknown[]) => mockUpdateTestimonial(...args),
  deleteTestimonial: (...args: unknown[]) => mockDeleteTestimonial(...args),
}));

import { PUT, DELETE } from "./route";

describe("PUT /api/admin/testimonials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when testimonial not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetTestimonialById.mockResolvedValue(null);
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated testimonial", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetTestimonialById.mockResolvedValue({ id: 1, name: "Old" });
    mockUpdateTestimonial.mockResolvedValue({ id: 1, name: "Updated" });
    const req = new Request("https://example.com", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ id: 1, name: "Updated" });
  });
});

describe("DELETE /api/admin/testimonials/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 200 with ok when deleted", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockGetTestimonialById.mockResolvedValue({ id: 1 });
    mockDeleteTestimonial.mockResolvedValue(undefined);
    const req = new Request("https://example.com", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual({ ok: true });
  });
});
