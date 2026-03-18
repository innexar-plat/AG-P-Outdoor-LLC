import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries/portfolio", () => ({
  listVisiblePortfolioItems: vi.fn(() =>
    Promise.resolve([{ id: 1, title: "Project 1", imageUrl: "https://img.test/1.jpg", visible: true }])
  ),
}));

import { GET } from "./route";

describe("GET /api/site/portfolio", () => {
  it("returns visible items without auth", async () => {
    const req = new Request("http://localhost/api/site/portfolio");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(1);
  });
});
