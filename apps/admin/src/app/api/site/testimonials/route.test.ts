import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries/testimonials", () => ({
  listApprovedTestimonials: vi.fn(() =>
    Promise.resolve([{ id: 1, name: "Jane", text: "Amazing!", rating: 5, approved: true }])
  ),
}));

import { GET } from "./route";

describe("GET /api/site/testimonials", () => {
  it("returns approved testimonials without auth", async () => {
    const req = new Request("http://localhost/api/site/testimonials");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(1);
    expect(json.data[0].approved).toBe(true);
  });
});
